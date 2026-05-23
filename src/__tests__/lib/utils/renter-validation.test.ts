import { describe, it, expect } from 'vitest';
import { validateRenterForm } from '@/lib/utils/renter-validation';
import { RenterFormDataDetails } from '@/types/renter.types';

describe('validateRenterForm', () => {
    const currentYear = new Date().getFullYear();
    
    const validBaseForm: RenterFormDataDetails = {
        renterName: 'John Doe',
        agreementId: 'ASD-210',
        agreementDate: `${currentYear}-01-15`,
        agreementDateFrom: `${currentYear}-01-15`,
        agreementDateTo: `${currentYear + 1}-01-14`,
        rentAmount: '5000.00',
        rentAmountAGR: '5000.00',
        rentAmountSUR: '',
        incrementFrequency: 'Yearly',
        incrementType: 'Percentage',
        incrementValue: '5',
        customDateRanges: []
    };

    it('should pass with valid data', () => {
        const errors = validateRenterForm(validBaseForm);
        expect(errors).toHaveLength(0);
    });

    describe('Agreement ID Validation', () => {
        it('should allow valid agreement IDs', () => {
            const allowed = ['AGR123', 'RENT2026', 'AG_101', 'AG-2025', '131425', '1000'];
            allowed.forEach(id => {
                const errors = validateRenterForm({ ...validBaseForm, agreementId: id });
                expect(errors.filter(e => e.field === 'agreementId')).toHaveLength(0);
            });
        });

        it('should reject empty or whitespace agreement ID', () => {
            const errors = validateRenterForm({ ...validBaseForm, agreementId: '' });
            const matched = errors.filter(e => e.field === 'agreementId');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Agreement ID is required.');
        });

        it('should reject invalid characters with correct error message', () => {
            const rejected = ['@ABC123', 'ABC#123', 'ABC 123', '12/05/2026'];
            rejected.forEach(id => {
                const errors = validateRenterForm({ ...validBaseForm, agreementId: id });
                const matched = errors.filter(e => e.field === 'agreementId');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Only letters, numbers, underscore (_) and hyphen (-) are allowed.');
            });
        });

        it('should reject lengths outside of 3 to 15 characters', () => {
            // Shorter than 3
            const shortErrors = validateRenterForm({ ...validBaseForm, agreementId: 'A1' });
            const shortMatched = shortErrors.filter(e => e.field === 'agreementId');
            expect(shortMatched).not.toHaveLength(0);
            expect(shortMatched[0].message).toBe('Agreement ID must be between 3 and 15 characters.');

            // Longer than 15
            const longErrors = validateRenterForm({ ...validBaseForm, agreementId: 'SDHGJFGKJGHKGHKGH' });
            const longMatched = longErrors.filter(e => e.field === 'agreementId');
            expect(longMatched).not.toHaveLength(0);
            expect(longMatched[0].message).toBe('Agreement ID must be between 3 and 15 characters.');
        });

        it('should reject values missing numeric values', () => {
            const rejected = ['qwerty', 'ABCDEF', '----', '___'];
            rejected.forEach(id => {
                const errors = validateRenterForm({ ...validBaseForm, agreementId: id });
                const matched = errors.filter(e => e.field === 'agreementId');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Agreement ID should contain at least one numeric value.');
            });
        });

        it('should reject repeated characters or keyboard patterns', () => {
            const rejected = ['aaaaaa1', '111111a', 'asdfgh1', 'qwerty2', 'zxcvbn3', 'abababa1', '111111', '----1'];
            rejected.forEach(id => {
                const errors = validateRenterForm({ ...validBaseForm, agreementId: id });
                const matched = errors.filter(e => e.field === 'agreementId');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Random or repeated characters are not allowed.');
            });
        });
    });

    describe('Renter Name Validation', () => {
        it('should allow valid renter names', () => {
            const validNames = ['Rahul Deshmukh', 'Yash Patil', 'Amit Sharma', 'Sneha Kulkarni', 'Raj Kumar'];
            validNames.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                expect(errors.filter(e => e.field === 'renterName')).toHaveLength(0);
            });
        });

        it('should reject empty renter name', () => {
            const errors = validateRenterForm({ ...validBaseForm, renterName: '' });
            const matched = errors.filter(e => e.field === 'renterName');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Renter Name is required.');
        });

        it('should reject renter names with numbers or special characters', () => {
            const invalidChars = ['Jane Doe 123', 'Jane Doe!', 'Jane@Doe'];
            invalidChars.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                const matched = errors.filter(e => e.field === 'renterName');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Renter Name should contain only alphabets and spaces.');
            });
        });

        it('should reject renter name shorter than 3 characters', () => {
            const errors = validateRenterForm({ ...validBaseForm, renterName: 'Jo' });
            const matched = errors.filter(e => e.field === 'renterName');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Renter Name must be at least 3 characters.');
        });

        it('should reject renter name longer than 100 characters', () => {
            const errors = validateRenterForm({ ...validBaseForm, renterName: 'J'.repeat(101) });
            const matched = errors.filter(e => e.field === 'renterName');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Renter Name cannot exceed 100 characters.');
        });

        it('should reject same character repeated continuously more than 3 times', () => {
            const repeated = ['jjjjjjjjjj', 'ssssssss', 'aaaaaaa', 'Rahul aaaa Deshmukh'];
            repeated.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                const matched = errors.filter(e => e.field === 'renterName');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Repeated or random characters are not allowed.');
            });
        });

        it('should reject repeated sequence patterns', () => {
            const repeatedSeq = ['abcabcabc', 'qweqwe', 'hahaha', 'qweqwe Deshmukh'];
            repeatedSeq.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                const matched = errors.filter(e => e.field === 'renterName');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Repeated or random characters are not allowed.');
            });
        });

        it('should reject common keyboard patterns', () => {
            const keyboard = ['asdfgh', 'qwerty', 'zxcvbn', 'Rahul qwerty Deshmukh'];
            keyboard.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                const matched = errors.filter(e => e.field === 'renterName');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Please enter a meaningful renter name.');
            });
        });

        it('should reject jjjsssss as repeated or random', () => {
            const errors = validateRenterForm({ ...validBaseForm, renterName: 'jjjsssss' });
            const matched = errors.filter(e => e.field === 'renterName');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Repeated or random characters are not allowed.');
        });

        it('should reject consonant-only / meaningless spam', () => {
            const spam = ['hsgdf', 'plkjh', 'qwrth'];
            spam.forEach(name => {
                const errors = validateRenterForm({ ...validBaseForm, renterName: name });
                const matched = errors.filter(e => e.field === 'renterName');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Please enter a meaningful renter name.');
            });
        });
    });

    describe('Agreement Date Validation (Current Year)', () => {
        it('should allow dates in the current year', () => {
            const errors = validateRenterForm({ ...validBaseForm, agreementDate: `${currentYear}-05-20` });
            expect(errors.filter(e => e.field === 'agreementDate')).toHaveLength(0);
        });

        it('should reject dates outside the current year', () => {
            const errorsPast = validateRenterForm({ ...validBaseForm, agreementDate: `${currentYear - 1}-12-31` });
            expect(errorsPast.filter(e => e.field === 'agreementDate')).not.toHaveLength(0);

            const errorsFuture = validateRenterForm({ ...validBaseForm, agreementDate: `${currentYear + 1}-01-01` });
            expect(errorsFuture.filter(e => e.field === 'agreementDate')).not.toHaveLength(0);
        });
    });

    describe('Duration From Date Validation (Current Year)', () => {
        it('should allow from dates in the current year', () => {
            const errors = validateRenterForm({ ...validBaseForm, agreementDateFrom: `${currentYear}-06-01` });
            expect(errors.filter(e => e.field === 'agreementDateFrom')).toHaveLength(0);
        });

        it('should reject from dates outside the current year', () => {
            const errorsPast = validateRenterForm({ ...validBaseForm, agreementDateFrom: `${currentYear - 1}-12-31` });
            expect(errorsPast.filter(e => e.field === 'agreementDateFrom')).not.toHaveLength(0);

            const errorsFuture = validateRenterForm({ ...validBaseForm, agreementDateFrom: `${currentYear + 1}-01-01` });
            expect(errorsFuture.filter(e => e.field === 'agreementDateFrom')).not.toHaveLength(0);
        });
    });

    describe('Rent Amount Validation', () => {
        it('should allow clean integers and up to 2 decimal places', () => {
            const allowed = ['5000', '5000.5', '5000.55'];
            allowed.forEach(amount => {
                const errors = validateRenterForm({ ...validBaseForm, rentAmount: amount });
                expect(errors.filter(e => e.field === 'rentAmount')).toHaveLength(0);
            });
        });

        it('should reject negative values, positive symbols, more than 2 decimals, or non-numeric', () => {
            const rejected = ['-5000', '+5000', '5000.555', '5000a', '0', '-1.50'];
            rejected.forEach(amount => {
                const errors = validateRenterForm({ ...validBaseForm, rentAmount: amount });
                expect(errors.filter(e => e.field === 'rentAmount')).not.toHaveLength(0);
            });
        });

        it('should reject Monthly Rent when integer part exceeds 10 digits', () => {
            const errors = validateRenterForm({ ...validBaseForm, rentAmount: '12345678901' });
            const matched = errors.filter(e => e.field === 'rentAmount');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Monthly Rent cannot exceed 10 digits.');
        });
    });

    describe('Increment Value Validation', () => {
        describe('Percentage Type Increment', () => {
            it('should allow valid numeric percentage values between 0 and 100 inclusive', () => {
                const allowed = ['0', '1', '5', '10', '100'];
                allowed.forEach(val => {
                    const errors = validateRenterForm({ 
                        ...validBaseForm, 
                        incrementType: 'Percentage', 
                        incrementValue: val 
                    });
                    expect(errors.filter(e => e.field === 'incrementValue')).toHaveLength(0);
                });
            });

            it('should reject non-numeric characters, decimals, negative signs, and letters', () => {
                const rejected = ['-5', '+5', '5.5', '5.50', 'abc', '10a', '10%'];
                rejected.forEach(val => {
                    const errors = validateRenterForm({ 
                        ...validBaseForm, 
                        incrementType: 'Percentage', 
                        incrementValue: val 
                    });
                    const matched = errors.filter(e => e.field === 'incrementValue');
                    expect(matched).not.toHaveLength(0);
                    expect(matched[0].message).toBe('Only numeric values are allowed.');
                });
            });

            it('should reject percentage values greater than 3 digits with the correct message', () => {
                const errors = validateRenterForm({ 
                    ...validBaseForm, 
                    incrementType: 'Percentage', 
                    incrementValue: '1000' 
                });
                const matched = errors.filter(e => e.field === 'incrementValue');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Maximum 3 digits allowed.');
            });

            it('should reject percentage values greater than 100 with the correct message', () => {
                const errors = validateRenterForm({ 
                    ...validBaseForm, 
                    incrementType: 'Percentage', 
                    incrementValue: '101' 
                });
                const matched = errors.filter(e => e.field === 'incrementValue');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Percentage cannot exceed 100.');
            });
        });

        describe('Fixed Type Increment', () => {
            it('should allow clean integers and up to 2 decimal places', () => {
                const allowed = ['5', '5.5', '5.55'];
                allowed.forEach(val => {
                    const errors = validateRenterForm({ 
                        ...validBaseForm, 
                        incrementType: 'Fixed', 
                        incrementValue: val 
                    });
                    expect(errors.filter(e => e.field === 'incrementValue')).toHaveLength(0);
                });
            });

            it('should reject negative values, positive symbols, or more than 2 decimals', () => {
                const rejected = ['-5', '+5', '5.555', 'abc', '0'];
                rejected.forEach(val => {
                    const errors = validateRenterForm({ 
                        ...validBaseForm, 
                        incrementType: 'Fixed', 
                        incrementValue: val 
                    });
                    const matched = errors.filter(e => e.field === 'incrementValue');
                    expect(matched).not.toHaveLength(0);
                    expect(matched[0].message).toBe('Increment Value must be greater than 0.');
                });
            });

            it('should reject Increment Value when integer part exceeds 5 digits', () => {
                const errors = validateRenterForm({ 
                    ...validBaseForm, 
                    incrementType: 'Fixed', 
                    incrementValue: '123456' 
                });
                const matched = errors.filter(e => e.field === 'incrementValue');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Increment Value cannot exceed allowed limit.');
            });
        });
    });

    describe('Custom Date Ranges Validation', () => {
        const formWithCustom: RenterFormDataDetails = {
            ...validBaseForm,
            incrementFrequency: 'Custom Date',
            customDateRanges: [
                {
                    id: '1',
                    fromDate: `${currentYear}-02-01`,
                    toDate: `${currentYear}-08-01`,
                    incrementType: 'Percentage',
                    incrementValue: 10,
                    calculationMethod: 'Base Value'
                }
            ]
        };

        it('should pass with valid custom date ranges', () => {
            const errors = validateRenterForm(formWithCustom);
            expect(errors.filter(e => e.field === 'customDateRanges')).toHaveLength(0);
        });

        it('should reject custom fromDate outside of current year', () => {
            const invalidForm = {
                ...formWithCustom,
                customDateRanges: [
                    {
                        ...formWithCustom.customDateRanges[0],
                        fromDate: `${currentYear - 1}-12-31`
                    }
                ]
            };
            const errors = validateRenterForm(invalidForm);
            expect(errors.filter(e => e.field === 'customDateRanges')).not.toHaveLength(0);
        });

        it('should reject custom percentage with non-numeric, negative, or letters with specific message', () => {
            const rejected = ['-5', '5.5', 'abc', '10a'];
            rejected.forEach(val => {
                const invalidForm = {
                    ...formWithCustom,
                    customDateRanges: [
                        {
                            ...formWithCustom.customDateRanges[0],
                            incrementType: 'Percentage' as const,
                            incrementValue: val as unknown as number
                        }
                    ]
                };
                const errors = validateRenterForm(invalidForm);
                const matched = errors.filter(e => e.field === 'customDateRanges');
                expect(matched).not.toHaveLength(0);
                expect(matched[0].message).toBe('Custom range #1 Only numeric values are allowed.');
            });
        });

        it('should reject custom percentage greater than 3 digits with specific message', () => {
            const invalidForm = {
                ...formWithCustom,
                customDateRanges: [
                    {
                        ...formWithCustom.customDateRanges[0],
                        incrementType: 'Percentage' as const,
                        incrementValue: '1000' as unknown as number
                    }
                ]
            };
            const errors = validateRenterForm(invalidForm);
            const matched = errors.filter(e => e.field === 'customDateRanges');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Custom range #1 Maximum 3 digits allowed.');
        });

        it('should reject custom percentage greater than 100 with specific message', () => {
            const invalidForm = {
                ...formWithCustom,
                customDateRanges: [
                    {
                        ...formWithCustom.customDateRanges[0],
                        incrementType: 'Percentage' as const,
                        incrementValue: '101' as unknown as number
                    }
                ]
            };
            const errors = validateRenterForm(invalidForm);
            const matched = errors.filter(e => e.field === 'customDateRanges');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Custom range #1 Percentage cannot exceed 100.');
        });

        it('should reject custom fixed increment when integer part exceeds 5 digits', () => {
            const invalidForm = {
                ...formWithCustom,
                customDateRanges: [
                    {
                        ...formWithCustom.customDateRanges[0],
                        incrementType: 'Fixed' as const,
                        incrementValue: 123456
                    }
                ]
            };
            const errors = validateRenterForm(invalidForm);
            const matched = errors.filter(e => e.field === 'customDateRanges');
            expect(matched).not.toHaveLength(0);
            expect(matched[0].message).toBe('Custom range #1 Increment Value cannot exceed allowed limit.');
        });
    });
});
