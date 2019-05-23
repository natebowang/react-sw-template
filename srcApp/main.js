import React from 'react';
import ReactDOM from 'react-dom';
// 2st option for service worker
// import runtime from 'serviceworker-webpack-plugin/lib/runtime';

const Main = () => (
    <div>Hello React!</div>
);

ReactDOM.render(<Main/>, document.getElementById('root'));

// 1st option for service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then(reg => console.debug('Service Worker: Registered'))
            .catch(err => 'Service Worker: Error.');
    });
}
// 2st option for service worker
// if ('serviceWorker' in navigator) {
//     const registration = runtime.register();
// }

// Hot module Replacement
// [Problems with event listener](https://webpack.js.org/guides/hot-module-replacement#gotchas)
if (module.hot) {
    module.hot.accept();
}
