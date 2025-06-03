// no idea whats going on here, generated with Claude 4

import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs';

// Set the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';

async function processPDF() {
    const fileInput = document.getElementById('pdfFile');
    const output = document.getElementById('output');

    if (!fileInput.files.length) {
        output.textContent = 'Please select a PDF file.';
        return;
    }

    const file = fileInput.files[0];
    if (!file.name.endsWith('.pdf')) {
        output.textContent = 'Please upload a valid PDF file.';
        return;
    }

    try {
        // Read the PDF file
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }

        // Display extracted text
        output.textContent = text || 'No text extracted.';

        // Send text to Flask server
        const response = await fetch('/receive_text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const result = await response.json();

        if (response.ok) {
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                output.textContent += "\n\nServer response received!";
            }
        } else {
            output.textContent += `\n\nServer error: ${result.error}`;
        }

    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
}

document.getElementById('pdfFile').addEventListener('change', () => {
    document.getElementById('output').textContent = '';
});


document.getElementById('processBtn').onclick = processPDF;
