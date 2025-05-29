const fs = require('fs');
const fsPromises = require('fs').promises;
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
        } else {
            throw new Error('Formato de arquivo não suportado');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const result = allRows
            .map(row => row[0])
            .filter(item => item != null && String(item).trim() !== '' && String(item).toLowerCase() !== 'null')
            .map(item => String(item).toLowerCase());

        console.log('result:', result);

        const outputDir = path.join(__dirname, '..', '..', '..', 'output');
        const outputPath = path.join(outputDir, 'variacoes.json');

        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(outputDir, { recursive: true });

        // fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        await fsPromises.writeFile(
            outputPath,
            JSON.stringify(result, null, 2),
            'utf8'
        );

        fs.unlinkSync(file.path);

        const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
        if (fs.existsSync(uploadsDir)) {
            fs.readdirSync(uploadsDir).forEach(item => {
                fs.rmSync(path.join(uploadsDir, item), { recursive: true, force: true });
            });
        }

        return result;
    } catch (error) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        console.error(error);
        throw new CustomError(error.message, 400);
    }
};

module.exports = { bulk };
