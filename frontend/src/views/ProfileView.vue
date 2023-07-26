<template>
  <div class="page-container">
    <div class="page-title">{{ $t('profile.my profile')}}</div>

    <card-component :header="$t('profile.change pin code')" :action="$t('profile.change pin code')" :func="changePinCode" class="change-pin-code" >
      <div id="update-pin-form">
        <div>
          <p>{{ $t('profile.new pin code')}}</p>
          <PinComponent v-model="inputPin" />
          <p class="warning">{{inputPinWarning}}</p>
        </div>
        <div>
          <p>{{ $t('profile.confirm new pin code')}}</p>
          <PinComponent v-model="confirmPin" />
          <p class="warning">{{confirmPinWarning}}</p>
        </div>
      </div>
    </card-component>

  </div>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import {watch, ref} from "vue";
import PinComponent from "@/components/PinComponent.vue";

const inputPin = ref();
const inputPinWarning = ref("");

const confirmPin = ref();
const confirmPinWarning = ref("");

//show warning message if pin is filled in and not 4 digits
watch(inputPin, (pin) => {
  if (pin.length == 0) {
    inputPinWarning.value = "";
  } else if (! RegExp('\\d{4}').test(pin)) {
    inputPinWarning.value = "your pin needs to have 4 digits";
  } else {
    inputPinWarning.value = "";
  }
})

//show warning message if conformation pin does not fit pin
watch(confirmPin, (pin) => {
  if (pin.length == 0){
    confirmPinWarning.value = ""
  } else if (pin != inputPin.value) {
    confirmPinWarning.value = "both pins need to be the same";
  } else {
    confirmPinWarning.value = "";
  }
})


const changePinCode = () => {
  //TODO update the pin
}

</script>

<style scoped>
@import "../styles/BasePage.css";

.warning {
  color: red;
  font-size: 75%;
}

</style>