<template>
  <Dialog v-model:visible="visible" class="w-120" :closable="false" :dismissable-mask="false" :draggable="false" modal>
    <div class="flex flex-col items-center gap-6 py-4">
      <p class="text-xl font-semibold text-center">Your cart contains alcoholic products.</p>
      <p class="text-center text-lg">Are you 18 years of age or older?</p>
      <div class="text-center w-full">
        <button class="legal-toggle text-[10px] opacity-60" @click="legalExpanded = !legalExpanded">
          {{ legalExpanded ? 'Hide legal notice ▲' : 'Read legal notice ▼' }}
        </button>
        <p v-if="legalExpanded" class="text-center">
          In accordance with applicable Dutch legislation, including but not limited to the Dutch Alcohol Act
          (Alcoholwet), we are required to verify that all individuals attempting to purchase alcoholic beverages have
          reached the legally permitted age. This requirement exists to ensure public health, promote responsible
          consumption, and maintain compliance with national and municipal regulations governing the sale and
          distribution of alcohol. By proceeding beyond this point, you acknowledge that you may be asked to provide
          valid identification confirming your age. Failure to provide such identification may result in denial of
          service, disappointment, mild confusion, and possibly a reflective moment about the passage of time and the
          nature of adulthood itself. At first glance, this process may appear straightforward. You confirm your age, we
          confirm your confirmation, and everything continues as expected. However, it is important to note that
          compliance processes, much like the Dutch weather, can occasionally take unexpected turns. For instance,
          consider the horse. Horses have historically played no direct role in age verification procedures within the
          Netherlands, yet they remain an important symbol of regulatory unpredictability. Much like a horse grazing
          peacefully in a field, unaware of municipal bylaws, one might attempt to bypass age verification with the same
          quiet confidence. This would be incorrect. The system, unlike the horse, is paying attention. Furthermore, one
          must consider the broader societal implications of verification systems. In certain theoretical discussions,
          age verification could be interpreted as a structured mechanism resembling bureaucratic frameworks found in
          various economic ideologies. Some have loosely (and perhaps irresponsibly) compared such systems to aspects of
          communism, in that all participants are subject to the same rules regardless of personal preference. This
          comparison is, of course, wildly oversimplified and should not be taken seriously, though it does raise
          interesting questions about shared responsibility, collective compliance, and whether a bartender counts as a
          central authority. As we continue, it is worth addressing the technological infrastructure behind this
          verification process. Modern systems may rely on digital frameworks, occasionally implemented in languages
          such as TypeScript. TypeScript, being a superset of JavaScript, introduces types into an otherwise dynamically
          typed environment, much like this disclaimer introduces structure into an otherwise unnecessary amount of
          text. One could argue that requiring types in programming is not unlike requiring proof of age: both attempt
          to prevent errors before they occur, though neither can fully account for human creativity. Lorem ipsum dolor
          sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
          aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. At this
          point, the disclaimer has fulfilled its original legal obligation several paragraphs ago, yet continues onward
          out of a sense of narrative momentum. You may begin to wonder whether continuing to read is necessary. This is
          a valid concern. However, much like standing in line at a busy bar, leaving now would mean losing your place,
          and nobody wants that. Returning briefly to horses, it is important to clarify that no horses are involved in
          the verification process, nor are they capable of purchasing alcohol under Dutch law. Should a horse attempt
          to do so, it would be denied service unless it could present valid identification, which, to date, has not
          occurred. Meanwhile, discussions of communism within this disclaimer remain purely illustrative and should not
          be interpreted as political endorsement, critique, or manifesto. The system does not redistribute beer equally
          among all patrons, though that would certainly simplify matters. As for TypeScript, if this disclaimer were
          written in code, it would likely include strict typing, multiple interfaces, and at least one overly complex
          generic that nobody fully understands. Fortunately, this is not code, although it may feel like debugging.
          Lorem ipsum continues to exist as a placeholder for meaning, much like this entire section. By now, you may
          have reached a state of acceptance. You came here to verify your age, and instead you have encountered a
          document that has expanded far beyond its original purpose. This is normal. This is expected. This is, in some
          ways, the true spirit of April Fool's. Before proceeding, please carefully read the following statement: By
          pressing the "Yes" button, you agree to purchase beer for all ABC members currently sitting at the bar. They
          are able to redeem this beer at any time they see fit. This clause is entirely binding within the fictional
          legal framework of this disclaimer and may or may not result in social consequences, depending on how
          seriously others take it. In conclusion, age verification is required by Dutch law. Horses remain uninvolved.
          Communism is not actually relevant. TypeScript is still useful. Lorem ipsum persists. And you, having read
          this far, are now fully prepared to make an informed decision. Thank you for your time, patience, and
          willingness to engage with an unnecessarily long disclaimer. Wie dit leest trekt een bak
        </p>
      </div>
      <div class="flex gap-6 w-full justify-center">
        <Button class="age-btn age-btn-yes text-xl font-bold px-8 py-4" @click="onYes"> Yes </Button>
        <Button class="age-btn age-btn-no text-xl font-bold px-8 py-4" @click="onNo"> No </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { playAudio, Sound } from '@/utils/audioUtil';

const toast = useToast();

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'confirmed'): void;
  (e: 'denied'): void;
}>();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const legalExpanded = ref(false);

watch(visible, (isVisible) => {
  if (isVisible) {
    legalExpanded.value = false;
    playAudio(Sound.POPUP);
  }
});

const onYes = () => {
  visible.value = false;
  emit('confirmed');
};

const onNo = () => {
  visible.value = false;
  emit('denied');
  toast.add({
    severity: 'error',
    summary: `User is underage, alcoholic products have been removed from cart`,
    life: 5000,
  });
};
</script>

<style scoped lang="scss">
.age-btn {
  min-width: 8rem;
  border: none;

  &-yes {
    background-color: var(--p-button-primary-hover-background);
    color: white;
  }

  &-no {
    background-color: green;
    color: white;
  }
}
</style>
