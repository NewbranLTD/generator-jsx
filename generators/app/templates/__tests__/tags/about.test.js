'use strict';
/**
 * about tag test file
 */
const riot = require('riot');
const about = require('../../app/scripts/components/about/about.tag');

const opts = 'about';

describe('Tag: about', () => {

    beforeAll( () => {
        // create mounting point
        const elem = document.createElement('about');

        elem.setAttribute('name', opts);

        document.body.appendChild(elem)
        riot.mount(elem, 'about');
    });

    test('should mount the about tag', () => {

        expect(document.querySelector('about h2').textContent).toBe(opts);
    });
});
