/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { FileUtils } from "../node_modules/igv-utils/src/index.js"

function getIndexObjectWithDataName  (name) {
    let extension,
        dataSuffix,
        lookup,
        indexObject,
        aa;

    extension = FileUtils.getExtension(name);

    if (false === isKnownFileExtension(extension)) {
        return undefined;
    }

    dataSuffix = name.split('.').pop();

    lookup = indexLookup(dataSuffix);

    indexObject = {};

    // aa
    aa = name + '.' + lookup.index;

    indexObject[aa] = {};
    indexObject[aa].data = name;
    indexObject[aa].isOptional = lookup.isOptional;


    if ('bam' === extension || 'cram' === extension) {
        let bb,
            parts;

        // bb
        parts = name.split('.');
        parts.pop();
        bb = parts.join('.') + '.' + lookup.index;

        indexObject[bb] = {};
        indexObject[bb].data = name;
        indexObject[bb].isOptional = lookup.isOptional;
    }

    return indexObject;
};

function isKnownFileExtension  (extension)  {
    let fasta = new Set(['fa', 'fasta']);
    let union = new Set([...(TrackUtils.knownFileExtensions), ...fasta]);
    return union.has(extension);
};

function configureModal  (fileLoadWidget, modal, okHandler) {

    const doDismiss = () => {
        fileLoadWidget.dismiss();
        $(modal).modal('hide');
    }

    const doOK = async () => {

        const result = await okHandler(fileLoadWidget);

        if (true === result) {
            fileLoadWidget.dismiss();
            $(modal).modal('hide');
        }
    }

    let dismiss;

    // upper dismiss - x - button
    dismiss = modal.querySelector('.modal-header button');
    dismiss.addEventListener('click', doDismiss);

    // lower dismiss - close - button
    dismiss = modal.querySelector('.modal-footer button:nth-child(1)');
    dismiss.addEventListener('click', doDismiss);

    // ok - button
    const ok = modal.querySelector('.modal-footer button:nth-child(2)');

    ok.addEventListener('click', doOK);

    modal.addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            doOK()
        }
    });
};

function indexLookup  (dataSuffix)  {

    const fa =
        {
            index: 'fai',
            isOptional: false
        };

    const fasta =
        {
            index: 'fai',
            isOptional: false
        };

    const bam =
        {
            index: 'bai',
            isOptional: false
        };

    const cram =
        {
            index: 'crai',
            isOptional: false
        };

    const gz =
        {
            index: 'tbi',
            isOptional: true
        };

    const bgz =
        {
            index: 'tbi',
            isOptional: true
        };

    const any =
        {
            index: 'idx',
            isOptional: true
        };

    const lut =
        {
            fa,
            fasta,
            bam,
            cram,
            gz,
            bgz
        };

    if (lut[dataSuffix]) {
        return lut[dataSuffix];
    } else {
        return any;
    }

}

export { getIndexObjectWithDataName, isKnownFileExtension, configureModal };
