import { usePointOfSaleStore } from "@/stores/pos.store";
import { PointOfSaleResponse } from "@sudosos/sudosos-client";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { useActivityStore } from "@/stores/activity.store";

let originalColor: string = '';

/**
 * Class to keep all logic regarding switching of the Point of Sale in one place.
 *
 * Watchers that watch PointOfSaleSore.getPos should predominantly consist
 * of function from this class.
 */
export class PointOfSaleSwitchService {
  public static switchTo(target: PointOfSaleResponse) {
    const posStore = usePointOfSaleStore();
    const activityStore = useActivityStore();
    const currentPos = posStore.getPos;

    // Guard to check fi we are actually switching
    if (!currentPos || (currentPos && target.id !== currentPos.id)) {

      posStore.fetchPointOfSale(target.id);

      // Switch buyer back to user if authentication
      const cartStore = useCartStore();
      cartStore.setBuyer(target.useAuthentication ? useAuthStore().getUser : null);
      cartStore.setLockedIn(null);

      target.useAuthentication ? activityStore.resetTimer() : activityStore.disableTimer();

      this.switchColor(target);
    }
  }

  private static switchColor(target: PointOfSaleResponse) {
    // In the future, this should be stored and retrieved from the backend.
    if (target.owner?.id === 18214 && !target.useAuthentication) {
      originalColor = document.documentElement.style.getPropertyValue('--accent-color');
      document.documentElement.style.setProperty('--accent-color', '#0f492e');
    } else {
      document.documentElement.style.setProperty('--accent-color', originalColor);
    }
  }
}
