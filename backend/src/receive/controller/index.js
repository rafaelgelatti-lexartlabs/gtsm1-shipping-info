const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const CustomError = require('../../middleware/customError');

const bulk = async (file) => {
    try {
        await fs.access(file.path);

        const ext = path.extname(file.path).toLowerCase();
        let workbook;
        if (ext === '.csv') {
            const csv = await fs.readFile(file.path, 'utf8');
            workbook = XLSX.read(csv, { type: 'string' });
        } else if (ext === '.xlsx') {
            const buffer = await fs.readFile(file.path);
            workbook = XLSX.read(buffer, { type: 'buffer' });
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
        const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');

        await fs.rm(outputDir, { recursive: true, force: true });
        await fs.mkdir(outputDir, { recursive: true });

        await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`✅ Arquivo salvo em ${outputPath}`);

        await fs.unlink(file.path);

        try {
            const items = await fs.readdir(uploadsDir);
            await Promise.all(items.map(item =>
                fs.rm(path.join(uploadsDir, item), { recursive: true, force: true })
            ));
        } catch (e) {
        }

        return result;
    } catch (error) {
        try { await fs.unlink(file.path); } catch { }
        console.error(error);
        throw new CustomError(error.message, 400);
    }
};

module.exports = { bulk };
