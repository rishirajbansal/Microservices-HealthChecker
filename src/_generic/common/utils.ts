export class Utility {
    static safeTrim(str: string | undefined): string {
        if (typeof str == 'undefined' || !str || str.length === 0 || str === '' || str === 'undefined' || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, '') === '') {
            return '';
        } else {
            return str.trim();
        }
    }

}
