import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import PeriodicTableGame from './App';
import ElementData from './ElementData.json';

// Mock the timer to prevent it from interfering with tests
jest.useFakeTimers();

afterEach(cleanup); // Clean up after each test

describe('PeriodicTableGame', () => {
    it('loads without crashing', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });
        expect(screen.getByRole('heading', { name: /Periodic Table Game/i })).toBeInTheDocument();
    });

    it('allows difficulty selection', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        const difficultySelect = screen.getByLabelText('Difficulty:');
        await act(async () => {
            fireEvent.change(difficultySelect, { target: { value: 'medium' } });
        });
        expect(difficultySelect.value).toBe('medium');
    });

    it('displays the correct number of elements based on difficulty and periods', async () => {
        const difficultiesAndPeriods = [
            { difficulty: 'easy', period: '', expectedElements: Object.keys(ElementData).length },
            { difficulty: 'medium', period: '', expectedElements: Object.keys(ElementData).length },
            { difficulty: 'hard', period: '', expectedElements: Object.keys(ElementData).length },
            { difficulty: 'easy', period: '1-3', expectedElements: 18 },
            { difficulty: 'medium', period: '1-4', expectedElements: 36 },
            { difficulty: 'hard', period: '1-5', expectedElements: 54 },
        ];

        for (const { difficulty, period, expectedElements } of difficultiesAndPeriods) {
            await act(async () => {
                render(<PeriodicTableGame />);
            });
            const difficultySelect = screen.getByLabelText('Difficulty:');
            await act(async () => {
                fireEvent.change(difficultySelect, { target: { value: `${difficulty}-${period}` } });
            });
            const displayedElements = screen.getAllByRole('button', { name: /element/i });
            expect(displayedElements.length).toBe(expectedElements);
            cleanup();
        }
    });

    it('shows "Play Again!" button after game over', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(screen.getByRole('button', { name: /Play Again/i })).toBeVisible();
    });

    it('has a Start button that starts the game', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Start/i }));
        });

        expect(screen.getByRole('heading', { level: 2, name: /Find:/i })).toBeVisible();
    });

    it('displays correct element content based on difficulty', async () => {
        const testCases = [
            { difficulty: 'easy', expectedContent: 'H' }, // Example: Symbol for easy
            { difficulty: 'medium', expectedContent: '1' }, // Example: Number for medium
            { difficulty: 'hard', expectedContent: '' },  // Empty for hard
        ];

        for (const { difficulty, expectedContent } of testCases) {
            await act(async () => {
                render(<PeriodicTableGame />);
            });

            await act(async () => {
                fireEvent.change(screen.getByLabelText('Difficulty:'), { target: { value: difficulty } });
            });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /Start/i }));
            });

            if (difficulty === "easy" || difficulty === "medium") {
                expect(screen.getByText(expectedContent)).toBeVisible();
            } else {
                const elementDiv = screen.getByRole('button');
                expect(elementDiv).toBeEmptyDOMElement();
            }

            cleanup();
        }
    });

    it('updates score correctly on click', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Difficulty:'), { target: { value: 'easy' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Start/i }));
        });

        const correctElement = screen.getByText(ElementData['H'].symbol);

        await act(async () => {
            fireEvent.click(correctElement);
        });
        expect(screen.getByText('Score: 1')).toBeVisible();

        const incorrectElement = screen.getByText(ElementData['He'].symbol);
        await act(async () => {
            fireEvent.click(incorrectElement);
        });
        expect(screen.getByText('Score: 1')).toBeVisible();
    });

    it('changes background color of clicked elements', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Difficulty:'), { target: { value: 'easy' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Start/i }));
        });

        const element = screen.getByText('H'); // Get the first element
        await act(async () => {
            fireEvent.click(element);
        });

        expect(element).toHaveClass('clicked'); // Replace 'clicked' with your actual class name
    });

    it('toggles between dark and light mode', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        const toggleButton = screen.getByRole('button', { name: /toggle-mode/i });

        // Initial mode (light mode)
        await act(async () => {
            fireEvent.click(toggleButton);
        });
        // Check for dark mode class in body
        expect(document.body).toHaveClass('dark-mode');

        await act(async () => {
            fireEvent.click(toggleButton);
        });
        // Check for light mode class in body
        expect(document.body).not.toHaveClass('dark-mode');
    });

    it('displays game over message with correct information', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Difficulty:'), { target: { value: 'easy' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Start/i }));
        });

        await act(async () => {
            jest.runAllTimers(); // Move timers to "end" to trigger game over
        });

        const gameOverMessage = screen.getByTestId('game-over');
        expect(gameOverMessage).toBeVisible();
        expect(gameOverMessage).toHaveTextContent(/Final Score:/i);
        expect(gameOverMessage).toHaveTextContent(/Elements Found:/i);
        expect(gameOverMessage).toHaveTextContent(/Attempts:/i);
    });

    it('displays all 118 elements by default', async () => {
        await act(async () => {
            render(<PeriodicTableGame />);
        });

        const displayedElements = screen.getAllByRole('button');
        expect(displayedElements.length).toBe(Object.keys(ElementData).length);
    });
});