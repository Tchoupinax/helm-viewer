<template>
  <modal>
    <template #body>
      <Shiki lang="text" :code="error" />
    </template>
  </modal>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
    },
  },
};
</script>
