// Global variables
let uploadedImages = {
    image1: null,
    image2: null
};

let conversionSettings = {
    format: 'jpeg',
    size: 'original',
    quality: 0.9,
    customWidth: null,
    customHeight: null,
    maintainAspectRatio: true,
    targetFileSize: null
};

let convertedImageData = null;
let originalImageData = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeUploadBoxes();
    initializeDropdowns();
    initializeButtons();
    initializeCustomSizeInputs();
});

// Upload boxes functionality
function initializeUploadBoxes() {
    setupUploadBox('uploadBox1', 'fileInput1', 'preview1', 'removeBtn1', 'fileInfo1', 'image1');
    setupUploadBox('uploadBox2', 'fileInput2', 'preview2', 'removeBtn2', 'fileInfo2', 'image2');
}

function setupUploadBox(boxId, inputId, previewId, removeBtnId, fileInfoId, imageKey) {
    const uploadBox = document.getElementById(boxId);
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const removeBtn = document.getElementById(removeBtnId);
    const fileInfo = document.getElementById(fileInfoId);

    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file, uploadBox, preview, removeBtn, fileInfo, imageKey);
        }
    });

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f0f0ff';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#ccc';
        uploadBox.style.background = '#fafafa';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            handleImageUpload(file, uploadBox, preview, removeBtn, fileInfo, imageKey);
        }
        uploadBox.style.borderColor = '#ccc';
        uploadBox.style.background = '#fafafa';
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(uploadBox, preview, removeBtn, fileInput, fileInfo, imageKey);
    });
}

function handleImageUpload(file, uploadBox, preview, removeBtn, fileInfo, imageKey) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.add('show');
        removeBtn.classList.add('show');
        uploadBox.classList.add('has-image');
        uploadBox.querySelector('.upload-content').style.display = 'none';
        
        const img = new Image();
        img.onload = () => {
            uploadedImages[imageKey] = {
                file: file,
                dataUrl: e.target.result,
                width: img.width,
                height: img.height,
                size: file.size,
                format: file.type.split('/')[1]
            };
            
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function removeImage(uploadBox, preview, removeBtn, fileInput, fileInfo, imageKey) {
    preview.src = '';
    preview.classList.remove('show');
    removeBtn.classList.remove('show');
    uploadBox.classList.remove('has-image');
    uploadBox.querySelector('.upload-content').style.display = 'block';
    fileInput.value = '';
    fileInfo.textContent = '';
    uploadedImages[imageKey] = null;
    hideComparisonSection();
}

// Dropdown functionality
function initializeDropdowns() {
    setupDropdown('formatBtn', 'formatDropdown', 'format');
    setupDropdown('sizeBtn', 'sizeDropdown', 'size');
    setupDropdown('qualityBtn', 'qualityDropdown', 'quality');
}

function setupDropdown(btnId, contentId, settingKey) {
    const btn = document.getElementById(btnId);
    const content = document.getElementById(contentId);
    const items = content.querySelectorAll('.dropdown-item');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = content.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) {
            content.classList.add('show');
            btn.classList.add('active');
        }
    });

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            const value = item.dataset.value;
            conversionSettings[settingKey] = settingKey === 'quality' ? parseFloat(value) : value;
            
            btn.querySelector('span').textContent = item.textContent;
            content.classList.remove('show');
            btn.classList.remove('active');

            // Show custom size inputs if custom size is selected
            if (settingKey === 'size' && value === 'custom') {
                document.getElementById('customSizeInputs').style.display = 'grid';
                document.getElementById('customKBInputs').style.display = 'none';
                if (originalImageData) {
                    document.getElementById('customWidth').value = originalImageData.width;
                    document.getElementById('customHeight').value = originalImageData.height;
                }
            } else if (settingKey === 'size' && value === 'custom-kb') {
                document.getElementById('customKBInputs').style.display = 'grid';
                document.getElementById('customSizeInputs').style.display = 'none';
            } else if (settingKey === 'size') {
                document.getElementById('customSizeInputs').style.display = 'none';
                document.getElementById('customKBInputs').style.display = 'none';
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        content.classList.remove('show');
        btn.classList.remove('active');
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Custom size inputs
function initializeCustomSizeInputs() {
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const targetFileSize = document.getElementById('targetFileSize');

    customWidth.addEventListener('input', () => {
        conversionSettings.customWidth = parseInt(customWidth.value) || null;
        if (maintainAspectRatio.checked && originalImageData && customWidth.value) {
            const aspectRatio = originalImageData.width / originalImageData.height;
            customHeight.value = Math.round(parseInt(customWidth.value) / aspectRatio);
            conversionSettings.customHeight = parseInt(customHeight.value);
        }
    });

    customHeight.addEventListener('input', () => {
        conversionSettings.customHeight = parseInt(customHeight.value) || null;
        if (maintainAspectRatio.checked && originalImageData && customHeight.value) {
            const aspectRatio = originalImageData.width / originalImageData.height;
            customWidth.value = Math.round(parseInt(customHeight.value) * aspectRatio);
            conversionSettings.customWidth = parseInt(customWidth.value);
        }
    });

    maintainAspectRatio.addEventListener('change', () => {
        conversionSettings.maintainAspectRatio = maintainAspectRatio.checked;
    });

    targetFileSize.addEventListener('input', () => {
        conversionSettings.targetFileSize = parseInt(targetFileSize.value) || null;
    });
}

// Button functionality
function initializeButtons() {
    document.getElementById('convertBtn').addEventListener('click', convertImage);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
}

async function convertImage() {
    if (!uploadedImages.image1 || !uploadedImages.image2) {
        alert('Please upload BOTH images to create a comparison!');
        return;
    }

    // First, create the merged image
    const mergedData = await createMergedImage();
    
    if (!mergedData) {
        alert('Error creating merged image!');
        return;
    }

    // Now apply conversion settings to the merged image
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
        let newWidth, newHeight;
        
        if (conversionSettings.size === 'custom-kb' && conversionSettings.targetFileSize) {
            // Use binary search to find the right scale factor for target file size
            const result = await findScaleForTargetFileSize(img, conversionSettings.targetFileSize);
            newWidth = result.width;
            newHeight = result.height;
        } else if (conversionSettings.size === 'custom' && conversionSettings.customWidth && conversionSettings.customHeight) {
            newWidth = conversionSettings.customWidth;
            newHeight = conversionSettings.customHeight;
        } else {
            newWidth = img.width;
            newHeight = img.height;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw merged image with new dimensions
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to new format
        const mimeType = `image/${conversionSettings.format}`;
        const dataUrl = canvas.toDataURL(mimeType, conversionSettings.quality);

        // Calculate file size estimate
        const base64Length = dataUrl.split(',')[1].length;
        const estimatedSize = Math.round((base64Length * 3) / 4);

        convertedImageData = {
            dataUrl: dataUrl,
            width: newWidth,
            height: newHeight,
            size: estimatedSize,
            format: conversionSettings.format
        };

        // Update original data to show merged image stats
        originalImageData = {
            ...mergedData,
            size: mergedData.size,
            width: mergedData.width,
            height: mergedData.height
        };

        // Display converted merged image
        displayConvertedImage();
        updateComparisonSection();
        
        // Show final preview
        showFinalPreview();
        
        document.getElementById('downloadBtn').disabled = false;
    };

    img.src = mergedData.dataUrl;
}

async function findScaleForTargetFileSize(img, targetKB) {
    const targetBytes = targetKB * 1024;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const mimeType = `image/${conversionSettings.format}`;
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    let minScale = 0.1;
    let maxScale = 1.0;
    let bestScale = 1.0;
    let iterations = 0;
    const maxIterations = 15;
    
    while (iterations < maxIterations && (maxScale - minScale) > 0.01) {
        const testScale = (minScale + maxScale) / 2;
        const testWidth = Math.round(img.width * testScale);
        const testHeight = Math.round(img.height * testScale);
        
        canvas.width = testWidth;
        canvas.height = testHeight;
        
        // Re-enable smoothing after canvas resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, testWidth, testHeight);
        
        const dataUrl = canvas.toDataURL(mimeType, conversionSettings.quality);
        const base64Length = dataUrl.split(',')[1].length;
        const estimatedSize = Math.round((base64Length * 3) / 4);
        
        if (estimatedSize > targetBytes) {
            maxScale = testScale;
        } else {
            minScale = testScale;
            bestScale = testScale;
        }
        
        iterations++;
    }
    
    return {
        width: Math.round(img.width * bestScale),
        height: Math.round(img.height * bestScale)
    };
}

function displayConvertedImage() {
    const preview2 = document.getElementById('preview2');
    const removeBtn2 = document.getElementById('removeBtn2');
    const uploadBox2 = document.getElementById('uploadBox2');
    const fileInfo2 = document.getElementById('fileInfo2');

    preview2.src = convertedImageData.dataUrl;
    preview2.classList.add('show');
    removeBtn2.classList.add('show');
    uploadBox2.classList.add('has-image');
    uploadBox2.querySelector('.upload-content').style.display = 'none';
    fileInfo2.textContent = `Converted (${formatFileSize(convertedImageData.size)})`;
}

function updateComparisonSection() {
    const comparisonSection = document.getElementById('comparisonSection');
    comparisonSection.style.display = 'block';

    // Original image stats
    document.getElementById('originalSize').textContent = `Size: ${formatFileSize(originalImageData.size)}`;
    document.getElementById('originalDimensions').textContent = `Dimensions: ${originalImageData.width} × ${originalImageData.height}px`;
    document.getElementById('originalFormat').textContent = `Format: ${originalImageData.format.toUpperCase()}`;

    // Converted image stats
    document.getElementById('convertedSize').textContent = `Size: ${formatFileSize(convertedImageData.size)}`;
    document.getElementById('convertedDimensions').textContent = `Dimensions: ${convertedImageData.width} × ${convertedImageData.height}px`;
    document.getElementById('convertedFormat').textContent = `Format: ${convertedImageData.format.toUpperCase()}`;

    // Size difference
    const sizeDiff = originalImageData.size - convertedImageData.size;
    const percentDiff = ((sizeDiff / originalImageData.size) * 100).toFixed(1);
    const diffElement = document.getElementById('sizeDifference');
    
    if (sizeDiff > 0) {
        diffElement.textContent = `📉 Reduced by ${formatFileSize(sizeDiff)} (${percentDiff}% smaller)`;
        diffElement.className = 'difference positive';
    } else if (sizeDiff < 0) {
        diffElement.textContent = `📈 Increased by ${formatFileSize(Math.abs(sizeDiff))} (${Math.abs(percentDiff)}% larger)`;
        diffElement.className = 'difference negative';
    } else {
        diffElement.textContent = '➡️ Same size';
        diffElement.className = 'difference';
    }
}

function hideComparisonSection() {
    document.getElementById('comparisonSection').style.display = 'none';
    document.getElementById('mergePreview').style.display = 'none';
    document.getElementById('downloadBtn').disabled = true;
    convertedImageData = null;
}

async function createMergedImage() {
    return new Promise((resolve) => {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        
        const img1 = new Image();
        const img2 = new Image();
        
        img1.src = uploadedImages.image1.dataUrl;
        img2.src = uploadedImages.image2.dataUrl;
        
        // Wait for both images to load
        Promise.all([
            new Promise(res => { img1.onload = res; }),
            new Promise(res => { img2.onload = res; })
        ]).then(() => {
            // Calculate canvas dimensions - make both images same height
            const maxHeight = Math.max(uploadedImages.image1.height, uploadedImages.image2.height);
            
            // Scale images to same height
            const img1Scale = maxHeight / uploadedImages.image1.height;
            const img2Scale = maxHeight / uploadedImages.image2.height;
            
            const img1Width = uploadedImages.image1.width * img1Scale;
            const img2Width = uploadedImages.image2.width * img2Scale;
            
            const gap = 10; // Small gap between images
            
            tempCanvas.width = img1Width + img2Width + gap;
            tempCanvas.height = maxHeight;
            
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw both images side by side with high quality
            ctx.drawImage(img1, 0, 0, img1Width, maxHeight);
            ctx.drawImage(img2, img1Width + gap, 0, img2Width, maxHeight);
            
            const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
            const base64Length = dataUrl.split(',')[1].length;
            const estimatedSize = Math.round((base64Length * 3) / 4);
            
            resolve({
                dataUrl: dataUrl,
                width: tempCanvas.width,
                height: tempCanvas.height,
                size: estimatedSize,
                format: 'png'
            });
        });
    });
}

function showFinalPreview() {
    const mergeCanvas = document.getElementById('mergeCanvas');
    const ctx = mergeCanvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        mergeCanvas.width = convertedImageData.width;
        mergeCanvas.height = convertedImageData.height;
        
        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0);
        document.getElementById('mergePreview').style.display = 'block';
    };
    
    img.src = convertedImageData.dataUrl;
}

function downloadImage() {
    if (!convertedImageData) {
        alert('Please convert images first!');
        return;
    }

    const outputName = document.getElementById('outputName').value || 'comparison';
    const link = document.createElement('a');
    link.download = `${outputName}.${conversionSettings.format}`;
    link.href = convertedImageData.dataUrl;
    link.click();
}

function resetAll() {
    // Reset images
    removeImage(
        document.getElementById('uploadBox1'),
        document.getElementById('preview1'),
        document.getElementById('removeBtn1'),
        document.getElementById('fileInput1'),
        document.getElementById('fileInfo1'),
        'image1'
    );
    removeImage(
        document.getElementById('uploadBox2'),
        document.getElementById('preview2'),
        document.getElementById('removeBtn2'),
        document.getElementById('fileInput2'),
        document.getElementById('fileInfo2'),
        'image2'
    );

    // Reset settings
    conversionSettings = {
        format: 'jpeg',
        size: 'original',
        quality: 0.9,
        customWidth: null,
        customHeight: null,
        maintainAspectRatio: true,
        targetFileSize: null
    };

    // Reset dropdowns
    document.querySelectorAll('.dropdown-btn span').forEach((span, index) => {
        if (index === 0) span.textContent = 'NEW IMAGE FORMAT';
        if (index === 1) span.textContent = 'NEW IMAGE SIZE';
        if (index === 2) span.textContent = 'NEW IMAGE QUALITY';
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Reset input
    document.getElementById('outputName').value = '';
    document.getElementById('customSizeInputs').style.display = 'none';
    document.getElementById('customKBInputs').style.display = 'none';
    document.getElementById('targetFileSize').value = '';

    // Reset comparison
    hideComparisonSection();
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}