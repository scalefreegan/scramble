import ModalTable from '../node_modules/data-modal/js/modalTable.js'
import EncodeTrackDatasource from "../node_modules/data-modal/js/encodeTrackDatasource.js"
import {encodeTrackDatasourceSignalConfigurator} from "../node_modules/data-modal/js/encodeTrackDatasourceSignalConfig.js"
import {encodeTrackDatasourceOtherConfigurator} from "../node_modules/data-modal/js/encodeTrackDatasourceOtherConfig.js"
import {createGenericSelectModal} from './genericSelectModal.js'
import {createTrackURLModal} from './trackURLModal.js'
import EventBus from "./eventBus.js"
import FileLoadManager from "./fileLoadManager.js"
import FileLoadWidget from "./fileLoadWidget.js"
import MultipleTrackFileLoad from "./multipleTrackFileLoad.js"
import * as Utils from './utils.js'
import AlertSingleton from './alertSingleton.js'


let fileLoadWidget;
let multipleTrackFileLoad;
let encodeModalTables = [];
let genomeChangeListener

function createTrackWidgets($igvMain,
                            $localFileInput,
                            $dropboxButton,
                            googleEnabled,
                            $googleDriveButton,
                            encodeTrackModalIds,
                            urlModalId,
                            trackLoadHandler) {

    const $urlModal = $(createTrackURLModal(urlModalId))
    $igvMain.append($urlModal);

    let fileLoadWidgetConfig =
        {
            widgetParent: $urlModal.find('.modal-body').get(0),
            dataTitle: 'Track',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        };

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths();
        await multipleTrackFileLoad.loadPaths(paths);
        return true;
    });

    if (!googleEnabled) {
        $googleDriveButton.parent().hide();
    }

    const multipleTrackFileLoadConfig =
        {
            $localFileInput,
            $dropboxButton,
            $googleDriveButton: googleEnabled ? $googleDriveButton : undefined,
            fileLoadHandler: trackLoadHandler,
            multipleFileSelection: true
        };

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

    for (let encodeTrackModalId of encodeTrackModalIds) {

        const encodeModalTableConfig =
            {
                id: encodeTrackModalId,
                title: 'ENCODE',
                selectionStyle: 'multi',
                pageLength: 100,
                selectHandler: trackLoadHandler
            }

        encodeModalTables.push(new ModalTable(encodeModalTableConfig))

    }

    genomeChangeListener = {

        receiveEvent: async ({data}) => {
            const {genomeID} = data;
            encodeModalTables[0].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)))
            encodeModalTables[1].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)))
        }
    }

    EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);

}

function createTrackWidgetsWithTrackRegistry($igvMain,
                                             $dropdownMenu,
                                             $localFileInput,
                                             $dropboxButton,
                                             googleEnabled,
                                             $googleDriveButton,
                                             encodeTrackModalIds,
                                             urlModalId,
                                             selectModalId,
                                             GtexUtils,
                                             trackRegistryFile,
                                             trackLoadHandler) {

    createTrackWidgets($igvMain, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, trackLoadHandler)

    const $genericSelectModal = $(createGenericSelectModal(selectModalId, `${selectModalId}-select`));
    $igvMain.append($genericSelectModal);

    const $select = $genericSelectModal.find('select');

    const $dismiss = $genericSelectModal.find('.modal-footer button:nth-child(1)');
    $dismiss.on('click', () => $genericSelectModal.modal('hide'));

    const $ok = $genericSelectModal.find('.modal-footer button:nth-child(2)');

    const okHandler = () => {

        const configurations = []
        const $selectedOptions = $select.find('option:selected')
        $selectedOptions.each(function () {
            //console.log(`You selected ${$(this).val()}`);
            configurations.push($(this).data('track'))
            $(this).removeAttr('selected');
        });

        if (configurations.length > 0) {
            trackLoadHandler(configurations)
        }

        $genericSelectModal.modal('hide');

    }

    $ok.on('click', okHandler);

    $genericSelectModal.get(0).addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            okHandler()
        }
    });

    genomeChangeListener = {

        receiveEvent: async ({data}) => {
            const {genomeID} = data;

            const encodeIsSupported = EncodeTrackDatasource.supportsGenome(genomeID)
            if (encodeIsSupported) {
                //console.log(`ENCODE supports genome ${genomeID}`)
                encodeModalTables[0].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)))
                encodeModalTables[1].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)))
            } else {
                //console.log(`ENCODE DOES NOT support genome ${genomeID}`)
            }

            await updateTrackMenus(genomeID, GtexUtils, encodeIsSupported, encodeModalTables, trackRegistryFile, $dropdownMenu, $genericSelectModal);
        }
    }

    EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);

}

async function updateTrackMenus(genomeID,
                                GtexUtils,
                                encodeIsSupported,
                                encodeModalTables,
                                trackRegistryFile,
                                $dropdownMenu,
                                $genericSelectModal) {

    const id_prefix = 'genome_specific_';

    const $divider = $dropdownMenu.find('.dropdown-divider');

    const searchString = '[id^=' + id_prefix + ']';
    const $found = $dropdownMenu.find(searchString);
    $found.remove();

    const paths = await getPathsWithTrackRegistryFile(genomeID, trackRegistryFile);

    if (undefined === paths) {
        console.warn(`There are no tracks in the track registryy for genome ${genomeID}`);
        return;
    }

    let responses = [];
    try {
        responses = await Promise.all(paths.map(path => fetch(path)))
    } catch (e) {
        AlertSingleton.present(e.message);
    }

    let jsons = [];
    try {
        jsons = await Promise.all(responses.map(response => response.json()))
    } catch (e) {
        AlertSingleton.present(e.message);
    }

    let buttonConfigurations = [];

    for (let json of jsons) {

        if ('ENCODE' === json.type) {

            let i = 0;
            for (let config of [encodeTrackDatasourceSignalConfigurator(genomeID), encodeTrackDatasourceOtherConfigurator(json.genomeID)]) {
                encodeModalTables[i++].setDatasource(new EncodeTrackDatasource(config))
            }

            buttonConfigurations.push(json);
        } else if ('GTEX' === json.type) {

            let info = undefined;
            try {
                info = await GtexUtils.getTissueInfo(json.datasetId);
            } catch (e) {
                AlertSingleton.present(e.message);
            }

            if (info) {
                json.tracks = info.tissueInfo.map(tissue => GtexUtils.trackConfiguration(tissue));
                buttonConfigurations.push(json);
            }

        } else {
            buttonConfigurations.push(json);
        }

    } // for (json)


    let encodeConfiguration
    let configurations = []
    for (let config of buttonConfigurations) {
        if (config.type && 'ENCODE' === config.type) {
            encodeConfiguration = config
        } else {
            configurations.unshift(config)
        }
    }

    if (encodeIsSupported) {

        createDropdownButton($divider, 'ENCODE Other', id_prefix)
            .on('click', () => encodeModalTables[1].$modal.modal('show'));

        createDropdownButton($divider, 'ENCODE Signals', id_prefix)
            .on('click', () => encodeModalTables[0].$modal.modal('show'));

    }

    for (let config of configurations) {

        const $button = createDropdownButton($divider, config.label, id_prefix)

        $button.on('click', () => {
            configureSelectModal($genericSelectModal, config);
            $genericSelectModal.modal('show');
        });

    }

};

function createDropdownButton($divider, buttonText, id_prefix) {
    const $button = $('<button>', {class: 'dropdown-item', type: 'button'})
    $button.text(`${buttonText} ...`)
    $button.attr('id', `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`)
    $button.insertAfter($divider)
    return $button
}

function configureSelectModal($genericSelectModal, buttonConfiguration) {

    let markup = `<div>${buttonConfiguration.label}</div>`

    // if (buttonConfiguration.description) {
    //     markup += `<div>${ buttonConfiguration.description }</div>`
    // }

    $genericSelectModal.find('.modal-title').text(`${buttonConfiguration.label}`);

    let $select = $genericSelectModal.find('select');
    $select.empty()

    buttonConfiguration.tracks.reduce(($accumulator, configuration) => {

        const $option = $('<option>', {value: configuration.name, text: configuration.name});
        $select.append($option);

        $option.data('track', configuration);

        $accumulator.append($option);

        return $accumulator;
    }, $select);

    if (buttonConfiguration.description) {
        $genericSelectModal.find('#igv-widgets-generic-select-modal-footnotes').html(buttonConfiguration.description)
    }

}

async function getPathsWithTrackRegistryFile(genomeID, trackRegistryFile) {

    let response = undefined;
    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
    }

    let trackRegistry = undefined
    if (response) {
        trackRegistry = await response.json();
    } else {
        const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()");
        AlertSingleton.present(e.message);
        throw e;
    }

    return trackRegistry[genomeID]

}

export {createTrackWidgets, createTrackWidgetsWithTrackRegistry}
