<template>
<footer>
  <span class="copyright">
    <b>{{ $t('login.copyright') }}</b>
  </span>
  <span class="separator">{{$t("login.separator")}}</span>
  <a id="tos" href="https://wieditleesttrekteenbak.nl/">{{$t('termsOfService.termsOfService')}}</a>
</footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 1rem;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
}

b {
  font-weight: bolder;
  color: black;
}

.separator {
  color: black;
  margin: 0 1rem;
}

#tos {
  color: red;
}
</style>
