'use strict';
/**
 * home tag test file
 */
const riot = require('riot');
const home = require('../../app/scripts/components/home/home.tag');

const opts = 'Home';

describe('Tag: home', () => {

    beforeAll( () => {
        // create mounting point
        const elem = document.createElement('home');

        elem.setAttribute('name', opts);

        document.body.appendChild(elem)
        riot.mount(elem, 'home');
    });

    test('should mount the home tag', () => {

        expect(document.querySelector('home h2').textContent).toBe(opts);
    });
});
