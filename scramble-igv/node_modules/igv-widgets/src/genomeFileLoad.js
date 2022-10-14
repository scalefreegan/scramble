import {FileUtils} from "../node_modules/igv-utils/src/index.js"
import FileLoad from "./fileLoad.js"
import AlertSingleton from './alertSingleton.js'

const referenceSet = new Set(['fai', 'fa', 'fasta']);
const dataSet = new Set(['fna', 'fa', 'fasta']);
const indexSet = new Set(['fai']);

// const errorString = 'ERROR: Load either: 1) single JSON file. 2) data file (.fa or .fasta ) & index file (.fai).';
const errorString = 'ERROR: Select both a sequence file (.fa or .fasta) and an index file (.fai).';
class GenomeFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr }) {
        super(
            { localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        if (1 === paths.length) {

            const path = paths[ 0 ];
            if ('json' === FileUtils.getExtension(path)) {
                const json = await this.igvxhr.loadJson((path.google_url || path));
                this.loadHandler(json);
            } else if ('xml' === FileUtils.getExtension(path)) {

                const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
                const o = {};
                o[ key ] = path;

                this.loadHandler(o);
            } else {
                AlertSingleton.present(`${ errorString }`);
            }

        } else if (2 === paths.length) {

            let [ a, b ] = paths.map(path => {
                return FileUtils.getExtension(path)
            });

            if (false === GenomeFileLoad.extensionValidator(a, b)) {
                AlertSingleton.present(`${ errorString }`);
                return;
            }

            const [ dataPath, indexPath ] = GenomeFileLoad.retrieveDataPathAndIndexPath(paths);

            await this.loadHandler({ fastaURL: dataPath, indexURL: indexPath });

        } else {
            AlertSingleton.present(`${ errorString }`);
        }

    };

    static retrieveDataPathAndIndexPath(paths) {

        let [ a, b ] = paths.map(path => FileUtils.getExtension(path))

        const [ la, lb ] = paths;

        let pa;
        let pb;
        if (dataSet.has(a) && indexSet.has(b)) {
            pa = la.google_url || la;
            pb = lb.google_url || lb;
        } else {
            pa = lb.google_url || lb;
            pb = la.google_url || la;
        }

        return [ pa, pb ];

    };

    static extensionValidator(a, b) {
        if (dataSet.has(a) && indexSet.has(b)) {
            return true;
        } else {
            return dataSet.has(b) && indexSet.has(a);
        }
    }

    static pathValidator(extension) {
        return referenceSet.has(extension);
    }

    static configurationHandler(dataKey, dataValue, indexPaths) {
        return { fastaURL: dataValue, indexURL: FileLoad.getIndexURL(indexPaths[ dataKey ]) };
    }

}

export default GenomeFileLoad;
