// Message templates with placeholders
const messageTemplates = {
    shortMainSms: "Hey {{firstName}}, I have my drivers in the area – is the car ready to go?",
    mainSms: "Hey {{firstName}}, this is Adam with Flix Auto Transport.\nI just received your quote request about the {{carYearMakeAndModel}} and I've got drivers available in that route.\nIs the vehicle ready to go? \n\nAdam \nTransport Manager at Flix AT \n(512) 543-1267",
    positiveReply1: "Hey {{firstName}}, I'm offering you a flat, guaranteed rate of {{totalPrice}} — tax included.\nThat covers full insurance up to $250K, door-to-door delivery, and up to 100 lbs of personal items at no extra charge.\nOnce the vehicle's moving, you'll have online tracking, 24/7 support, and no upfront payments or cancellation fees.\n my name is Adam and I represent FlixAutoTransport.com — one of the top 3 rated in the country.",
    negativeResponse1: "I'll keep this locked in for you but, Just a heads-up — a lot of lowball quotes out there look good, but most come with bait-and-switch tactics. No hidden fees here.",
    followUp1: "Hey {{firstName}}, just following up — If you're ready, I can get your vehicle on the schedule with a guaranteed rate and full coverage.\nNo upfront payment, no hassle.\nLet me know how you'd like to move forward.\n– Adam, Flix Auto Transport"
};

// DOM elements
const customerNameInput = document.getElementById('customerName');
const carDetailsInput = document.getElementById('carDetails');
const totalPriceInput = document.getElementById('totalPrice');
const templateSelect = document.getElementById('templateSelect');
const messageOutput = document.getElementById('messageOutput');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const copyStatus = document.getElementById('copyStatus');

const milesInput = document.getElementById('milesInput');
const deliveryEstimate = document.getElementById('deliveryEstimate');

const carrierPayInput = document.getElementById('carrierPay');
const payMilesInput = document.getElementById('payMiles');
const rateOutput = document.getElementById('rateOutput');

// Message Generator functionality
function generateMessage() {
    const customerName = customerNameInput.value.trim();
    const carDetails = carDetailsInput.value.trim();
    const totalPrice = totalPriceInput.value.trim();
    const selectedTemplate = templateSelect.value;

    if (!selectedTemplate) {
        messageOutput.value = '';
        copyBtn.disabled = true;
        return;
    }

    let message = messageTemplates[selectedTemplate];
    
    // Replace placeholders with actual values or defaults
    message = message.replace(/\{\{firstName\}\}/g, customerName || '[Customer Name]');
    message = message.replace(/\{\{carYearMakeAndModel\}\}/g, carDetails || '[Vehicle Details]');
    message = message.replace(/\{\{car\}\}/g, carDetails || '[Vehicle Details]');
    message = message.replace(/\{\{totalPrice\}\}/g, totalPrice ? `$${totalPrice}` : '[Total Price]');

    messageOutput.value = message;
    copyBtn.disabled = false;
}

// Copy functionality
async function copyMessage() {
    try {
        await navigator.clipboard.writeText(messageOutput.value);
        showStatus('Message copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        messageOutput.select();
        document.execCommand('copy');
        showStatus('Message copied to clipboard!', 'success');
    }
}

// Clear all fields in message generator
function clearAllFields() {
    customerNameInput.value = '';
    carDetailsInput.value = '';
    totalPriceInput.value = '';
    templateSelect.value = '';
    messageOutput.value = '';
    copyBtn.disabled = true;
    hideStatus();
}

// Show status message
function showStatus(message, type = 'success') {
    copyStatus.textContent = message;
    copyStatus.className = `status-message ${type}`;
    
    setTimeout(() => {
        hideStatus();
    }, 3000);
}

// Hide status message
function hideStatus() {
    copyStatus.style.opacity = '0';
    setTimeout(() => {
        copyStatus.className = 'status-message';
    }, 300);
}

// Delivery time calculation
function calculateDeliveryTime() {
    const miles = parseFloat(milesInput.value);
    
    if (!miles || miles <= 0) {
        deliveryEstimate.textContent = 'Enter miles to calculate';
        // Clear miles in pay calculator when delivery estimator is empty
        payMilesInput.value = '';
        calculatePayRate();
        return;
    }

    const days = Math.ceil(miles / 500);
    let estimate;

    if (days === 1) {
        estimate = 'About 1 day';
    } else if (days === 2) {
        estimate = 'About 2 days';
    } else if (days <= 3) {
        estimate = 'About 2–3 days';
    } else if (days <= 5) {
        estimate = `About ${days-1}–${days} days`;
    } else {
        estimate = `About ${days} days`;
    }

    deliveryEstimate.textContent = estimate;
    
    // Always sync miles to pay calculator
    payMilesInput.value = miles;
    calculatePayRate();
}

// Pay rate calculation
function calculatePayRate() {
    const pay = parseFloat(carrierPayInput.value);
    const miles = parseFloat(payMilesInput.value);

    if (!pay || !miles || pay <= 0 || miles <= 0) {
        rateOutput.textContent = 'Enter pay and miles to calculate';
        return;
    }

    const rate = pay / miles;
    rateOutput.textContent = `$${rate.toFixed(2)} per mile`;
}

// Event listeners for Message Generator
customerNameInput.addEventListener('input', generateMessage);
carDetailsInput.addEventListener('input', generateMessage);
totalPriceInput.addEventListener('input', generateMessage);
templateSelect.addEventListener('change', generateMessage);
copyBtn.addEventListener('click', copyMessage);
clearBtn.addEventListener('click', clearAllFields);

// Event listeners for Delivery Time Estimator
milesInput.addEventListener('input', calculateDeliveryTime);

// Event listeners for Pay Calculator
carrierPayInput.addEventListener('input', calculatePayRate);
payMilesInput.addEventListener('input', calculatePayRate);

// Cross-tool integration: sync miles between tools
milesInput.addEventListener('input', function() {
    // Always sync miles value (even if empty) to keep tools in sync
    payMilesInput.value = this.value;
    calculatePayRate();
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set initial states
    copyBtn.disabled = true;
    
    // Add smooth focus transitions
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.01)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    console.log('Auto Tools Dashboard initialized successfully!');
});

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Additional validation helpers
function validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Enhanced error handling for clipboard operations
function handleClipboardError(error) {
    console.error('Clipboard operation failed:', error);
    showStatus('Failed to copy message. Please try again.', 'error');
}

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to calculation functions for better performance
const debouncedDeliveryCalc = debounce(calculateDeliveryTime, 300);
const debouncedPayCalc = debounce(calculatePayRate, 300);

// Replace direct event listeners with debounced versions for better UX
milesInput.removeEventListener('input', calculateDeliveryTime);
milesInput.addEventListener('input', debouncedDeliveryCalc);

carrierPayInput.removeEventListener('input', calculatePayRate);
carrierPayInput.addEventListener('input', debouncedPayCalc);

payMilesInput.removeEventListener('input', calculatePayRate);
payMilesInput.addEventListener('input', debouncedPayCalc);
