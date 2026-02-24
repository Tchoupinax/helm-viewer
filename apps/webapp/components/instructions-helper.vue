<template>
  <div
    class="z-50 flex flex-col items-center justify-center absolute bg-white top-0 bottom-0 right-0 left-0"
  >
    <div
      class="tracking-widest h-12 inline-block p-2 rounded-lg font-extralight text-2xl letter-sp"
    >
      Helm-viewer is ready to gather your Helm charts. Let's play!
    </div>

    <div
      class="tracking-widest bg-gray-100 mt-16 h-12 inline-block p-2 px-6 rounded-lg font-extralight text-xl letter-sp"
    >
      <code> npm i -g helm-viewer </code>
    </div>
    <div
      class="tracking-widest bg-gray-100 mt-4 h-12 inline-block p-2 px-6 rounded-lg font-extralight text-xl letter-sp"
    >
      <code> helm-viewer path/to/your/chart </code>
    </div>

    <div
      class="mt-16 tracking-widest h-12 inline-block p-2 rounded-lg font-extralight text-2xl letter-sp"
    >
      To have more informations
    </div>

    <div
      class="tracking-widest bg-gray-100 mt-4 h-12 inline-block p-2 px-6 rounded-lg font-extralight text-xl letter-sp"
    >
      <code> helm-viewer --help </code>
    </div>
  </div>
</template>
