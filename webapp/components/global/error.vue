<template>
  <modal>
    <template #body>
      <div class="w-full h-full" v-html="code" />
    </template>
  </modal>
</template>

<script>
import { getHighlighter } from 'shikiji'

export default {
  props: {
    error: {
      type: String,
    }
  },
  data() {
    return {
      code: 'const a = 1;'
    }
  },
  async mounted() {
    const shiki = await getHighlighter({
      themes: ['nord'],
      langs: ["markdown"]
    })

    if (this.error) {
      this.code = shiki.codeToHtml(this.error, { lang: "markdown" })
    }
  }
}
</script>