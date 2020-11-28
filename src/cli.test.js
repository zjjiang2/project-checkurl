const { cli, versionOption } = require('./cli');


describe('versionOption Tests', () => {

    function checkArgs(options, ignoreUrl, showAll, showBad, showGood, showJson, showVersion, telescope){
        expect(typeof options).toBe('object');
        expect(options.ignoreUrl).toBe(ignoreUrl);
        expect(options.showAll).toBe(showAll);
        expect(options.showBad).toBe(showBad);
        expect(options.showGood).toBe(showGood);
        expect(options.showJson).toBe(showJson);
        expect(options.showVersion).toBe(showVersion);
        expect(options.telescope).toBe(telescope);
    }

    test('No Arguments Passed', () => {
        const args = ['C:\\Program Files\\nodejs\\node.exe',
        'C:\\Users\\jason\\AppData\\Roaming\\npm\\node_modules\\project-checkurl\\bin\\project-checkurl'];
        const options = versionOption(args)
        checkArgs(options, "", false, false, false, false, false, false);
    });

    test('Check Version Test', () => {
        const args = ['C:\\Program Files\\nodejs\\node.exe',
        'C:\\Users\\jason\\AppData\\Roaming\\npm\\node_modules\\project-checkurl\\bin\\project-checkurl',
        '--v'];
        const options = versionOption(args)
        checkArgs(options, "", false, false, false, false, true, false);
    });

    test('Json Output Test', () => {
        const args = ['C:\\Program Files\\nodejs\\node.exe',
        'C:\\Users\\jason\\AppData\\Roaming\\npm\\node_modules\\project-checkurl\\bin\\project-checkurl',
        '--good',
        '--json',
        '.\\urls.txt'];
        const options = versionOption(args)
        checkArgs(options, "", false, false, true, true, false, false);
    });

    test('All Arguments Passed', () => {
        const args = ['C:\\Program Files\\nodejs\\node.exe',
        'C:\\Users\\jason\\AppData\\Roaming\\npm\\node_modules\\project-checkurl\\bin\\project-checkurl',
        '--ignore',
        '.\\ignore-urls.txt',
        '--good',
        '--bad',
        '--all',
        '--json',
        '--telescope',
        '--version',
        '.\\urls.txt'];
        const options = versionOption(args)
        checkArgs(options, '.\\ignore-urls.txt', true, true, true, true, true, true);
    });
});


