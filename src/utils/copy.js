export function initCodeCopy() {
    document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
      if (wrapper.dataset.listen) return;
      
      const copyBtn = wrapper.querySelector('.copy-btn');
      const pre = wrapper.querySelector('pre');
      
      copyBtn.addEventListener('click', async () => {
        try {
          const code = pre?.innerText || '';
          await navigator.clipboard.writeText(code);
          copyBtn.classList.add('copied');
          setTimeout(() => copyBtn.classList.remove('copied'), 2000);
        } catch (err) {
          console.error('复制失败:', err);
        }
      });
      
      wrapper.dataset.listen = 'true';
    });
  }