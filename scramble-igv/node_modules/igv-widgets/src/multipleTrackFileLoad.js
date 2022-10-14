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

import AlertSingleton from './alertSingleton.js'
import { FileUtils, URIUtils, GooglePicker, TrackUtils, GoogleUtils, GoogleDrive } from "../node_modules/igv-utils/src/index.js"

class MultipleTrackFileLoad {

    constructor({ $localFileInput, $dropboxButton, $googleDriveButton, fileLoadHandler, multipleFileSelection }) {

        this.fileLoadHandler = fileLoadHandler;

        $localFileInput.on('change', async () => {

            if (true === MultipleTrackFileLoad.isValidLocalFileInput($localFileInput)) {

                const input = $localFileInput.get(0);
                const { files } = input;
                const paths = Array.from(files);

                input.value = '';

                await ingestPaths({ paths, fileLoadHandler });
            }

        });

        $dropboxButton.on('click', () => {

            const obj =
                {
                    success: dbFiles => ingestPaths({ paths: dbFiles.map(({link}) => link), fileLoadHandler }),
                    cancel: () => { },
                    linkType: "preview",
                    multiselect: multipleFileSelection,
                    folderselect: false,
                };

            Dropbox.choose(obj);
        });

        if ($googleDriveButton) {

            $googleDriveButton.on('click', () => {

                GooglePicker.createDropdownButtonPicker(multipleFileSelection, async responses => {

                    // const paths = responses.map(async ({ name, url }) => {
                    //     return { url: GoogleUtils.driveDownloadURL(url), name, filename: name, format: TrackUtils.inferFileFormat(name) }
                    // });

                    await ingestPaths({ paths : responses.map(({ name, url }) => url), fileLoadHandler });
                });

            });

        }

    }

    async loadPaths(paths) {
        await ingestPaths({ paths, fileLoadHandler: this.fileLoadHandler })
    }

    static isValidLocalFileInput($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    }

    static async getFilename(path ){

        if (path instanceof File) {
            return path.name
        } else if (GoogleUtils.isGoogleDriveURL(path)) {
            const info = await GoogleDrive.getDriveFileInfo(path)
            return info.name || info.originalFileName
        } else {
            const result = URIUtils.parseUri(path)
            return result.file;
        }

    }

    static isGoogleDrivePath(path) {
        return path instanceof File ? false : GoogleUtils.isGoogleDriveURL( path )
    }

}

const indexExtensions = new Set(['bai', 'csi', 'tbi', 'idx', 'crai'])

const requireIndex = new Set(['bam', 'cram'])

async function ingestPaths({ paths, fileLoadHandler }) {
    try {
        await doIngestPaths({paths, fileLoadHandler})
    } catch (e) {
        console.error(e)
        AlertSingleton.present(e.message);
    }
}

async function doIngestPaths({paths, fileLoadHandler}) {

    // Search for index files  (.bai, .csi, .tbi, .idx)
    const indexLUT = new Map();

    const dataPaths = [];
    for(let path of paths) {

        const name = await MultipleTrackFileLoad.getFilename(path)
        const extension = FileUtils.getExtension(name)

        if (indexExtensions.has(extension)) {

            // key is the data file name
            const key = createIndexLUTKey(name, extension)
            indexLUT.set(key, { indexURL: path, indexFilename: MultipleTrackFileLoad.isGoogleDrivePath( path ) ? name : undefined });
        } else {
            dataPaths.push(path);
        }

    }

    const configurations = [];

    for(let dataPath of dataPaths) {

        const name = await MultipleTrackFileLoad.getFilename(dataPath)

        const format = TrackUtils.inferFileFormat(name);

        if (format) {

            if (indexLUT.has(name)) {

                const {indexURL, indexFilename} = indexLUT.get(name)
                configurations.push({url: dataPath, name, indexURL, indexFilename, format})
            } else if (requireIndex.has(FileUtils.getExtension(name))) {
                throw new Error(`ERROR: ${ name } does not have an index file.`)
            } else {
                configurations.push({ url: dataPath, name, format })
            }

        } else {
            throw new Error(`ERROR: Unable to load track file ${ name }. Unknown format.`)
        }

    }

    if (configurations) {
        fileLoadHandler(configurations)
    }

}

const createIndexLUTKey = (name, extension) => {

    let key = name.substring(0, name.length - (extension.length + 1))

    // bam and cram files (.bai, .crai) have 2 conventions:
    // <data>.bam.bai
    // <data>.bai - we will support this one

    if('bai' === extension && !key.endsWith('bam')) {
        return `${ key }.bam`
    } else if('crai' === extension && !key.endsWith('cram')) {
        return `${ key }.cram`
    } else {
        return key
    }

}

export default MultipleTrackFileLoad;
