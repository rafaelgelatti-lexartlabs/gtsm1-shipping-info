const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const CustomError = require('../../middleware/customError');

const bulk = async (file) => {
    try {
        if (!fs.existsSync(file.path)) {
            throw new Error('Arquivo temporário não encontrado');
        }

        const ext = path.extname(file.path).toLowerCase();
        let workbook;
        if (ext === '.csv') {
            const csv = fs.readFileSync(file.path, 'utf8');
            workbook = XLSX.read(csv, { type: 'string' });
        } else if (ext === '.xlsx') {
            workbook = XLSX.readFile(file.path);
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const firstColumn = allRows.map(row => row[0]);
        const result = firstColumn.reduce((acc, item) => {
            if (item !== null && item !== undefined && item !== '' && item !== ' ' && item !== 'null') {
                acc.push(String(item).toLowerCase());
            }
            return acc;
        }, []);
        const outputPath = path.join(__dirname, '..', '..', '..', 'output', 'variacoes.json');

        fs.rmSync(path.dirname(outputPath), { recursive: true, force: true });
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        fs.unlinkSync(file.path);

        return result;
    } catch (error) {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        console.log(error);
        throw new CustomError(error.message, 400);
    }
}

module.exports = {
    bulk
}