import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    return (
        <div>Hello React!</div>
    )
};

ReactDOM.render(<App/>, document.getElementById('root'));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then(reg => console.debug('Service Worker: Registered'))
            .catch(err => 'Service Worker: Error.');
    });
}
