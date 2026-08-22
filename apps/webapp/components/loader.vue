<template>
  <div
    class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink"
  >
    <HelmMark mark-class="helm-spin h-14 w-14 text-signal" />
    <p class="mt-6 font-display text-2xl text-foam">Rendering chart</p>
    <p class="mt-1 font-mono text-[12px] tracking-widest text-mist">
      loading templates
    </p>
  </div>
</template>

<style scoped>
.helm-spin {
  animation: helm-spin 4.5s linear infinite;
}

@keyframes helm-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
