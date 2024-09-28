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


