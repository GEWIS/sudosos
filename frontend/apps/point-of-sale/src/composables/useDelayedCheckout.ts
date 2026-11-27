import { computed, onScopeDispose, ref } from 'vue';
import { TransactionRequest, UserResponse } from '@gewis/sudosos-client';
import { useToast } from 'openvue/usetoast';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { userApiService } from '@/services/ApiService';
import { playAudio, Sound } from '@/utils/audioUtil';

const UNDO_MS = 3000;
const TICK_MS = 100;

export interface PlacedOrder {
  buyer: UserResponse;
  products: CartProduct[];
  total: number;
  /** Buyer balance after this order, in cents; null when it is not known. */
  balanceAfter: number | null;
}

/**
 * Places the cart as a transaction after a short undo window.
 *
 * Members cannot delete their own transactions (only admins may), so undo
 * cannot be a delete afterwards: the transaction is held here and only sent
 * once the window has passed. The cart is emptied right away, so the next
 * order can start while the previous one is still undoable.
 */
export function useDelayedCheckout(onPlaced: (order: PlacedOrder) => void | Promise<void>) {
  const cartStore = useCartStore();
  const toast = useToast();

  const pending = ref<PlacedOrder | null>(null);
  const sending = ref(false);
  const remainingMs = ref(0);
  let request: TransactionRequest | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;

  const secondsLeft = computed(() => Math.ceil(remainingMs.value / 1000));
  const progress = computed(() => remainingMs.value / UNDO_MS);

  const stopTimer = () => {
    clearInterval(timer);
    timer = undefined;
  };

  const restore = (order: PlacedOrder) => {
    // Merge back rather than overwrite: in borrel mode a next order may
    // already be in the cart.
    order.products.forEach((product) => cartStore.addToCart({ ...product }));
    if (cartStore.buyer?.id !== order.buyer.id) void cartStore.setBuyer(order.buyer);
  };

  const send = async () => {
    stopTimer();
    const order = pending.value;
    if (!order || !request || sending.value) return;
    sending.value = true;
    try {
      await userApiService.transaction.createTransaction({ transactionRequest: request });
      playAudio(Sound.CASHOUT);
      pending.value = null;
      await onPlaced(order);
    } catch (error) {
      console.error(error);
      pending.value = null;
      restore(order);
      toast.add({ severity: 'error', summary: 'Order not placed', detail: 'Please try again.', life: 5000 });
    } finally {
      sending.value = false;
      request = null;
    }
  };

  /** Empty the cart into a pending order; returns false when nothing could be placed. */
  const place = (createdById: number): boolean => {
    const buyer = cartStore.buyer;
    if (!buyer || pending.value || cartStore.cartTotalCount === 0) return false;
    request = cartStore.buildTransactionRequest(buyer.id, createdById);
    if (!request) return false;

    const total = cartStore.getTotalPrice;
    pending.value = {
      buyer,
      products: cartStore.products.map((product) => ({ ...product })),
      total,
      balanceAfter: cartStore.buyerBalance ? cartStore.buyerBalance.amount - total : null,
    };
    cartStore.clearCart();

    remainingMs.value = UNDO_MS;
    timer = setInterval(() => {
      remainingMs.value -= TICK_MS;
      if (remainingMs.value <= 0) void send();
    }, TICK_MS);
    return true;
  };

  const undo = () => {
    const order = pending.value;
    if (!order || sending.value) return;
    stopTimer();
    pending.value = null;
    request = null;
    restore(order);
  };

  // Leaving the screen (e.g. switching POS) must not silently drop a sale.
  onScopeDispose(() => {
    if (pending.value && !sending.value) void send();
  });

  return { pending, sending, secondsLeft, progress, place, undo };
}
