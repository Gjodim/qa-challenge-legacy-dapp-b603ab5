const { test, expect } = require('@playwright/test');
const ListPage = require('../tests/pages/listPage');


test.describe('List Page Content', () => {

    test('Navigate to List page"', async ({ page }) => {
        const listPage = new ListPage(page);
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    let listPage

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify components existence and visibility', async ({ page }) => {
        // Verify all list components are rendered
        await listPage.verifyListComponents();
    });

    test('Verify filter options', async ({ page }) => {
        // Verify filter options under each filter
        await listPage.verifyFilterOptions();
    });

    test('Verify number of list items', async ({ page }) => {
        //const listPage = new ListPage(page);

        // Step 2: Verify that the list renders 10 items initially
        await listPage.verifyInitialListItemCount(10);
    });

})


test.describe('List Item Element Verification', () => {

    let listPage

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify list items content', async ({ page }) => {

        // Step 2: Verify list items have the expected elements
        await listPage.verifyListItemsElements();
    });

    test('Verify that titles correspond to the correct action types', async (page) => {
        await listPage.verifyTitlesAndTypes();
    });


});

test.describe('Loading Tests', () => {
    let listPage;

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    // Test: Click "Load More" button until it disappears and verify items are loaded
    test('should load more items until button disappears', async () => {
        // Initial item count
        let initialCount = await listPage.getItemCount();
        expect(initialCount).toBeGreaterThan(0); // Ensure there are some initial items

        // Click the "Load More" button until it's no longer visible and count items
        await listPage.clickLoadMoreUntilHidden();

        // Get new item count after all clicks
        let finalCount = await listPage.getItemCount();

        // Verify more items have been loaded
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('Should refresh the page and check for loading elements', async ({ page }) => {
        // Refresh the page
        await page.reload();

        // Wait for potential loading elements
        const loadingGifBySrc = page.locator('img[src*="loading.gif"]');
        const loadingGifByTitle = page.locator('img[title="List Loading"]');
        const spinnerMain = page.locator('.SpinnerLoader_main__lTEZ2');
        const spinnerLoader = page.locator('.SpinnerLoader_loader__W1avf');

        // Check if any of the elements are visible
        const isLoadingGifBySrcVisible = await loadingGifBySrc.isVisible().catch(() => false);
        const isLoadingGifByTitleVisible = await loadingGifByTitle.isVisible().catch(() => false);
        const isSpinnerMainVisible = await spinnerMain.isVisible().catch(() => false);
        const isSpinnerLoaderVisible = await spinnerLoader.isVisible().catch(() => false);

        // Log the result
        if (isLoadingGifBySrcVisible || isLoadingGifByTitleVisible || isSpinnerMainVisible || isSpinnerLoaderVisible) {
            console.log('A loading element is present on the page after refresh.');
        } else {
            console.log('No loading element is present on the page after refresh.');
        }

        // Expect that at least one of the loading elements should be present
        expect(
            isLoadingGifBySrcVisible || isLoadingGifByTitleVisible || isSpinnerMainVisible || isSpinnerLoaderVisible
        ).toBeTruthy();
    });

});


test.describe('Loading Tests', () => {
    let listPage;

    test.beforeEach(async ({ page }) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()

        /*// Initial item count
        let initialCount = await listPage.getItemCount();
        expect(initialCount).toBeGreaterThan(0); // Ensure there are some initial items

        // Click the "Load More" button until it's no longer visible and count items
        await listPage.clickLoadMoreUntilHidden();

        // Get new item count after all clicks
        let finalCount = await listPage.getItemCount();

        // Verify more items have been loaded
        expect(finalCount).toBeGreaterThan(initialCount);*/
    });


    test('should verify list is sorted by date ascending', async () => {
        const daysArray = await listPage.verifySortingByDate('asc');
        //const parsedDaysArray = daysArray.map(day => Number(day)); // Ensure all elements are numbers
        console.log(`days array is: ${daysArray}`);
        // Check if the days are sorted in ascending order
        const isSorted = daysArray.every((val, i, arr) => i === 0 || val <= arr[i]); // Allow same day values
        console.log(`is sorted is ${isSorted}`);
        if (!isSorted) throw new Error('Days are not sorted in ascending order.');
    });

    test('should verify list is sorted by date descending', async () => {
        const daysArray = await listPage.verifySortingByDate('desc');
        //const parsedDaysArray = daysArray.map(day => Number(day)); // Ensure all elements are numbers
        console.log(`days array is: ${daysArray}`);
        // Check if the days are sorted in ascending order
        const isSorted = daysArray.every((val, i, arr) => i === 0 || val >= arr[i]); // Allow same day values
        console.log(`is sorted is ${isSorted}`);
        if (!isSorted) throw new Error('Days are not sorted in ascending order.');
    });


test('should filter by team and verify results for Root', async () => {
    await listPage.filterByTeam('Root'); // Replace with expected team name
});

    test('should filter by team and verify results for Normandy', async () => {
        await listPage.filterByTeam('Normandy'); // Replace with expected team name
    });

    test('should filter by team and verify results for Koprulu', async () => {
        await listPage.filterByTeam('Koprulu'); // Replace with expected team name
    });


    test('should filter by type "Payment" and verify results', async () => {
        await listPage.filterByType('Payment'); // Replace with expected type
    });

    test('should filter by type "Mint" and verify results', async () => {
    await listPage.filterByType('Mint'); // Replace with expected type
});

    test('should filter by type "Transfer" and verify results', async () => {
        await listPage.filterByType('Transfer'); // Replace with expected type
    });

    test('should filter by type "Reputation" and verify results', async () => {
        await listPage.filterByType('Reputation'); // Replace with expected type
    });

    test('should filter by type "Permissions" and verify results', async () => {
        await listPage.filterByType('Permissions'); // Replace with expected type
    });

    test('should filter by type "Upgrade" and verify results', async () => {
        await listPage.filterByType('Upgrade'); // Replace with expected type
    });

    test('should filter by type "Details" and verify results', async () => {
        await listPage.filterByType('Details'); // Replace with expected type
    });

    test('should filter by type "Address" and verify results', async () => {
        await listPage.filterByType('Address'); // Replace with expected type
    });

    test('should filter by type "Teams" and verify results', async () => {
        await listPage.filterByType('Teams'); // Replace with expected type
    });

    test('should filter by type "Generic" and verify results', async () => {
        await listPage.filterByType('Generic'); // Replace with expected type
    });

test('should apply team "Koprulu", type filter "Payment" and verify sorting ascending', async () => {
    //i've removed the 'asc' option for sorting by date since i have to click each item and this resets the filters
    await listPage.verifyCombinedFilters('Koprulu', 'Payment', 'asc');
});

    test('should apply team "Root", type filter "Reputation" and verify sorting descending', async () => {
        //i've removed the 'asc' option for sorting by date since i have to click each item and this resets the filters
        await listPage.verifyCombinedFilters('Root', 'Reputation', 'desc');
    });
});


