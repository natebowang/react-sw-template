import React from 'react';
import ReactDOM from 'react-dom';

const Main = () => (
    <div>Hello React!</div>
);

ReactDOM.render(<Main/>, document.getElementById('root'));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then(reg => console.debug('Service Worker: Registered'))
            .catch(err => 'Service Worker: Error.');
    });
}
