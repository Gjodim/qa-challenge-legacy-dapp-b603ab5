const { test, expect } = require('@playwright/test');
const ListPage = require('../tests/pages/listPage');
const { verifyTitleCorrespondsToType } = require('../tests/helpers/helper');
const transactionMapping = require('../tests/data/transactionMapping');


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
        const listPage = new ListPage(page);

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

    test('Verify titles correspond to correct transaction types', async ({ page }) => {
        // Selector for the list containing the transaction items
        const listSelector = '.ActionsList_main__sMpx5';

        // Verify that titles correspond to the correct types based on the mapping
        await verifyTitleCorrespondsToType(page, listPage.selectors.list, transactionMapping);
    });

});


