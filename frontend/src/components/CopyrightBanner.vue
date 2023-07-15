<template>
<footer>
  <span class="copyright">
    <b>© 2023 GEWIS</b>
  </span>
  <span class="separator"> | </span>
  <a id="tos" href="https://wieditleesttrekteenbak.nl/">Terms of Service</a>
</footer>
</template>

<script>
export default {
  name: "CopyrightBanner"
}
</script>

<style scoped>
footer {
  position: absolute;
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
