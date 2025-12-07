function debounce(fn, delay = 100) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    const returnTopBtn = document.querySelector('.returnTop');

    scrollTop > 600 ? returnTopBtn.style.display = 'flex' : returnTopBtn.style.display = 'none';
}

const debouncedScroll = debounce(handleScroll, 100);

window.addEventListener('scroll', debouncedScroll);

window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', debouncedScroll);
});