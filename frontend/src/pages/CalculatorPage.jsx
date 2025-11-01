// frontend/src/pages/CalculatorPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Weight, Package, Info, AlertCircle, TrendingUp } from 'lucide-react';

const CalculatorPage = () => {
    const { t } = useTranslation();
    const [calculationType, setCalculationType] = useState('weight');
    const [weightsInput, setWeightsInput] = useState('');
    const [pricesInput, setPricesInput] = useState('');
    const [lotQuantitiesInput, setLotQuantitiesInput] = useState('');
    const [useTOT, setUseTOT] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const calculateHandler = (e) => {
        e.preventDefault();
        setError('');
        setResults(null);

        let calculatedResults = {
            individualProductResults: [],
            grandTotal: 0,
        };

        let quantities = [];
        let pricesPerFeresula = [];

        try {
            if (calculationType === 'weight') {
                quantities = weightsInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
                pricesPerFeresula = pricesInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
            } else {
                quantities = lotQuantitiesInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
                pricesPerFeresula = pricesInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
            }

            if (quantities.length === 0 || pricesPerFeresula.length === 0) {
                throw new Error(t('inputDataMissingError'));
            }
            if (quantities.length !== pricesPerFeresula.length) {
                throw new Error(t('inputMismatchError'));
            }

            let totalGrandTotal = 0;

            quantities.forEach((quantity, index) => {
                const pricePerFeresula = pricesPerFeresula[index];
                
                let tradeValue, ecxCharge, finalResult, pricePerKg;

                if (calculationType === 'weight') {
                    // Weight Formula
                    tradeValue = (quantity * (pricePerFeresula / 17) + (quantity / 85 * 153)) * 1.15;
                    ecxCharge = ((tradeValue * 0.005) + (quantity / 100 * 26)) * 1.15;
                    pricePerKg = tradeValue / quantity;
                    
                } else {
                    // Lot Formula
                    tradeValue = ((quantity * 150 * pricePerFeresula) + (quantity * 30 * 153)) * 1.15;
                    ecxCharge = ((tradeValue * 0.005) + (quantity * 25.5 * 26)) * 1.15;
                    pricePerKg = tradeValue / (quantity * 150);
                }

                // Calculate final result
                finalResult = tradeValue + ecxCharge;

                // Apply TOT (2%) if selected
                if (useTOT) {
                    finalResult *= 1.02;
                }

                calculatedResults.individualProductResults.push({
                    type: calculationType === 'weight' ? t('weight') : t('lot'),
                    quantity: quantity,
                    pricePerFeresula: pricePerFeresula,
                    pricePerKg: pricePerKg,
                    totalBirr: finalResult,
                    tradeValue: tradeValue,
                    ecxCharge: ecxCharge,
                    totApplied: useTOT
                });

                totalGrandTotal += finalResult;
            });

            calculatedResults.grandTotal = totalGrandTotal;
            setResults(calculatedResults);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className=" mx-auto">
            <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {t('Price Calculation')}
                            </h1>
                            <p className="text-white/80 text-xs mt-0.5">
                                Enter weight and price per Feresula (17 kg) to calculate total coffee pricing
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <form onSubmit={calculateHandler} className="space-y-4">
                        {/* Calculation Method Toggle */}
                        <div className="bg-gray-50 p-1 rounded-xl inline-flex w-full">
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-1 text-sm ${calculationType === 'weight'
                                        ? 'bg-white text-coffee-dark shadow-md'
                                        : 'text-gray-600 hover:text-coffee-dark'
                                    }`}
                                onClick={() => {
                                    setCalculationType('weight');
                                    setResults(null);
                                    setError('');
                                }}
                            >
                                <Weight className="w-4 h-4" />
                                <span>{t('Weight Formula')}</span>
                            </button>
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-1 text-sm ${calculationType === 'lot'
                                        ? 'bg-white text-coffee-dark shadow-md'
                                        : 'text-gray-600 hover:text-coffee-dark'
                                    }`}
                                onClick={() => {
                                    setCalculationType('lot');
                                    setResults(null);
                                    setError('');
                                }}
                            >
                                <Package className="w-4 h-4" />
                                <span>{t('Lot Formula')}</span>
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-3">
                            {calculationType === 'weight' ? (
                                <>
                                    <div>
                                        <label htmlFor="weights" className="block text-sm font-semibold text-gray-700 mb-1">
                                            {t('Weights')}
                                            <span className="text-gray-500 font-normal ml-1">(in kilograms)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="weights"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="Example: 100, 150, 200"
                                            value={weightsInput}
                                            onChange={(e) => setWeightsInput(e.target.value)}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                                            <Info className="w-3 h-3 mr-1" />
                                            Enter weights separated by commas
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="prices" className="block text-sm font-semibold text-gray-700 mb-1">
                                            {t('Prices Per Feresula')}
                                            <span className="text-gray-500 font-normal ml-1">(17 kg)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="prices"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="Example: 5000, 5200, 4800"
                                            value={pricesInput}
                                            onChange={(e) => setPricesInput(e.target.value)}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                                            <Info className="w-3 h-3 mr-1" />
                                            Enter prices separated by commas
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="lotQuantities" className="block text-sm font-semibold text-gray-700 mb-1">
                                            {t('Lot Quantities')}
                                            <span className="text-gray-500 font-normal ml-1">(number of lots)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lotQuantities"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="Example: 2, 3, 1"
                                            value={lotQuantitiesInput}
                                            onChange={(e) => setLotQuantitiesInput(e.target.value)}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                                            <Info className="w-3 h-3 mr-1" />
                                            Enter lot quantities separated by commas
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="prices" className="block text-sm font-semibold text-gray-700 mb-1">
                                            {t('Prices Per Feresula')}
                                            <span className="text-gray-500 font-normal ml-1">(17 kg)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="prices"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="Example: 5000, 5200, 4800"
                                            value={pricesInput}
                                            onChange={(e) => setPricesInput(e.target.value)}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                                            <Info className="w-3 h-3 mr-1" />
                                            Enter prices separated by commas
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* TOT Checkbox */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="useTOT"
                                    className="mt-0.5 h-4 w-4 text-coffee-accent focus:ring-coffee-accent border-gray-300 rounded"
                                    checked={useTOT}
                                    onChange={(e) => setUseTOT(e.target.checked)}
                                />
                                <div className="ml-2">
                                    <span className="text-sm font-semibold text-gray-900">{t('Apply TOT')}</span>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Turnover Tax (TOT) adds 2% to the final calculation
                                    </p>
                                </div>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-linear-to-r from-coffee-dark to-coffee-accent text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2 flex items-center justify-center space-x-1"
                        >
                            <Calculator className="w-4 h-4" />
                            <span>{t('calculate')}</span>
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {results && (
                        <div className="mt-6 space-y-4">
                            {/* Individual Results */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-1 mb-2">
                                    <TrendingUp className="w-4 h-4 text-coffee-accent" />
                                    <h2 className="text-lg font-bold text-coffee-dark">
                                        Individual Product Results
                                    </h2>
                                </div>

                                {results.individualProductResults.map((product, index) => (
                                    <div key={index} className="bg-linear-to-r from-cream to-coffee-light p-3 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-coffee-dark">
                                                Product #{index + 1}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold text-coffee-accent">
                                                {product.quantity} {product.type === t('weight') ? 'kg' : 'lots'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-gray-600 mb-0.5">Price per Feresula</p>
                                                <p className="font-semibold text-coffee-dark">
                                                    {product.pricePerFeresula.toLocaleString()} Birr
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-0.5">Price per Kg</p>
                                                <p className="font-semibold text-coffee-dark">
                                                    {product.pricePerKg.toFixed(2)} Birr/kg
                                                </p>
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-gray-300">
                                                <p className="text-gray-600 mb-0.5">Total Amount</p>
                                                <p className="text-lg font-bold text-coffee-accent">
                                                    {product.totalBirr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600 space-y-0.5">
                                            <div className="flex justify-between">
                                                <span>Trade Value:</span>
                                                <span className="font-medium">{product.tradeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ECX Charge:</span>
                                                <span className="font-medium">{product.ecxCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr</span>
                                            </div>
                                            {product.totApplied && (
                                                <div className="flex justify-between text-amber-700">
                                                    <span>TOT Applied (2%):</span>
                                                    <span className="font-medium">Included in Total</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grand Total */}
                            <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4 rounded-xl shadow-xl text-white">
                                <h2 className="text-sm font-semibold mb-1 opacity-90">
                                    Grand Total (All Products)
                                </h2>
                                <p className="text-2xl font-bold mb-1">
                                    {results.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                                </p>
                                <p className="text-xs opacity-80">
                                    Sum of all individual product totals
                                </p>
                            </div>

                            {/* Caution */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-yellow-800 text-xs">
                                    ⚠️ {t(' Results may vary due to weight inaccuracies')}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Formula Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            Calculation Formulas
                        </h3>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="bg-white p-2 rounded-lg">
                                <p className="font-semibold text-gray-700 mb-1">Weight Formula:</p>
                                <p className="font-mono text-xs">Trade Value = (Weight × (Price ÷ 17) + (Weight/85 × 153)) × 1.15</p>
                                <p className="font-mono text-xs mt-0.5">ECX = ((Trade Value × 0.005) + (Weight/100 × 26)) × 1.15</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                                <p className="font-semibold text-gray-700 mb-1">Lot Formula:</p>
                                <p className="font-mono text-xs">Trade Value = ((Lot × 150 × Price) + (Lot × 30 × 153)) × 1.15</p>
                                <p className="font-mono text-xs mt-0.5">ECX = ((Trade Value × 0.005) + (Lot × 25.5 × 26)) × 1.15</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                                <p className="font-semibold text-gray-700">Final Result = Trade Value + ECX Charge</p>
                                <p className="text-xs mt-0.5">TOT (2%) applied to final result when selected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculatorPage;