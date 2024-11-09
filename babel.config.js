module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['transform-inline-environment-variables', {
      include: [
        'VUE_APP_BASE_API'
      ]
    }]
  ]
}
