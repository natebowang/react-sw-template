import react from 'react';
import reactdom from 'react-dom';

const main = () => {
    return (
        <div>hello react!</div>
    )
};

reactdom.render(<main/>, document.getelementbyid('root'));

if ('serviceworker' in navigator) {
    window.addeventlistener('load', () => {
        navigator.serviceworker
            .register('sw.js')
            .then(reg => console.debug('service worker: registered'))
            .catch(err => 'service worker: error.');
    });
}

