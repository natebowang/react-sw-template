import React from 'react';
import ReactDOM from 'react-dom';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

const Main = () => (
    <div>Hello React!</div>
);

ReactDOM.render(<Main/>, document.getElementById('root'));

if ('serviceWorker' in navigator) {
    const registration = runtime.register();
}

// 1st option for service worker
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker
//             .register('./sw.js')
//             .then(reg => console.debug('Service Worker: Registered'))
//             .catch(err => 'Service Worker: Error.');
//     });
// }
