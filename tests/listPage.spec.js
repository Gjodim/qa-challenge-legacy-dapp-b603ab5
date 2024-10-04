const {test, expect} = require('@playwright/test');
const ListPage = require('../tests/pages/listPage');


test.describe('List Page Content tests', () => {

    test('Navigate to List page"', async ({page}) => {
        const listPage = new ListPage(page);
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    let listPage

    test.beforeEach(async ({page}) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify components existence and visibility', async ({page}) => {
        // Verify all list components are rendered
        await listPage.verifyListComponents();
    });

    test('Verify filter options', async ({page}) => {
        // Verify filter options under each filter
        await listPage.verifyFilterOptions();
    });

    test('Verify number of list items', async ({page}) => {
        //Verify that the list renders 10 items initially
        await listPage.verifyInitialListItemCount(10);
    });

})


test.describe('List Item Element Verification tests', () => {

    let listPage

    test.beforeEach(async ({page}) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify list items content', async ({page}) => {
        // Verify list items have the expected elements
        await listPage.verifyListItemsElements();
    });

    test('Verify that titles correspond to the correct action types', async (page) => {
        // Verify list items have expected titles and types
        await listPage.verifyTitlesAndTypes();
    });


});

test.describe('Loading Tests', () => {
    let listPage;

    test.beforeEach(async ({page}) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify load more button loads items until button disappears', async () => {
        // Initial item count
        let initialCount = await listPage.getItemCount();
        // Ensure there are some initial items
        expect(initialCount).toBeGreaterThan(0);

        // Click the "Load More" button until it's no longer visible and count items
        await listPage.clickLoadMoreUntilHidden();

        // Get new item count after all clicks
        let finalCount = await listPage.getItemCount();

        // Verify more items have been loaded
        expect(finalCount).toBeGreaterThan(initialCount);
    });

    ///
    // This does rarely work (i am not sure if i am understanding the task correctly)
    // I've left the code in the test and not in the helper methods so that it can be seen easier what's done
    test('Verify loader us visible', async ({page}) => {
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


test.describe('Filter Tests', () => {
    let listPage;

    test.beforeEach(async ({page}) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });


    test('Verify list is sorted by date ascending', async () => {
        // Get the sorted days in an array
        const daysArray = await listPage.verifySortingByDate('asc');
        console.log(`days array is: ${daysArray}`);
        // Check if the days are sorted in ascending order
        const isSorted = daysArray.every((val, i, arr) => i === 0 || val <= arr[i]); // Allow same day values
        console.log(`is sorted is ${isSorted}`);
        if (!isSorted) throw new Error('Days are not sorted in ascending order.');
    });

    test('Verify list is sorted by date descending', async () => {
        // Get the sorted days in an array
        const daysArray = await listPage.verifySortingByDate('desc');
        console.log(`days array is: ${daysArray}`);
        // Check if the days are sorted in ascending order
        const isSorted = daysArray.every((val, i, arr) => i === 0 || val >= arr[i]); // Allow same day values
        console.log(`is sorted is ${isSorted}`);
        if (!isSorted) throw new Error('Days are not sorted in ascending order.');
    });


    test('Verify list is filtered by team "Root"', async () => {
        await listPage.filterByTeam('Root');
    });

    test('Verify list is filtered by team "Normandy"', async () => {
        await listPage.filterByTeam('Normandy');
    });

    test('Verify list is filtered by team "Koprulu"', async () => {
        await listPage.filterByTeam('Koprulu');
    });


    test('Verify list is filtered by type "Payment"', async () => {
        await listPage.filterByType('Payment');
    });

    test('Verify list is filtered by type "Mint"', async () => {
        await listPage.filterByType('Mint');
    });

    test('Verify list is filtered by type "Transfer"', async () => {
        await listPage.filterByType('Transfer');
    });

    test('Verify list is filtered by type "Reputation"', async () => {
        await listPage.filterByType('Reputation');
    });

    test('Verify list is filtered by type "Permissions"', async () => {
        await listPage.filterByType('Permissions');
    });

    test('Verify list is filtered by type "Upgrade"', async () => {
        await listPage.filterByType('Upgrade');
    });

    test('Verify list is filtered by type "Details"', async () => {
        await listPage.filterByType('Details');
    });

    test('Verify list is filtered by type "Address"', async () => {
        await listPage.filterByType('Address');
    });

    test('Verify list is filtered by type "Teams"', async () => {
        await listPage.filterByType('Teams');
    });

    test('Verify list is filtered by type "Generic"', async () => {
        await listPage.filterByType('Generic');
    });

    test('Verify list is filtered by team filter "Koprulu", type filter "Payment" and ascending order', async () => {
        // I've removed the 'asc' option for sorting by date since i have to click each item and this resets the filters (a bug)
        await listPage.verifyCombinedFilters('Koprulu', 'Payment', 'asc');
    });

    test('Verify list is filtered by team filter "Root", type filter "Reputation" and descending order', async () => {
        // I've removed the 'desc' option for sorting by date since i have to click each item and this resets the filters (a bug)
        await listPage.verifyCombinedFilters('Root', 'Reputation', 'desc');
    });
});


test.describe('Popover Tests', () => {
    let listPage;

    test.beforeEach(async ({page}) => {
        listPage = new ListPage(page);
        // Navigate to the list page before each test
        await listPage.navigate();
        await listPage.navigatedToPage()
    });

    test('Verify popover opens for all items', async () => {
        for (let i = 0; i < 10; i++) {
            await listPage.openPopover(i);
            // I am refreshing the so that the popover disappears and we start over
            await listPage.navigate();
            await listPage.navigatedToPage();
        }
    });

    test('Verify popover closes for all items', async () => {
        for (let i = 0; i < 10; i++) {
            await listPage.closePopover(i);
        }
    });

    test('Verify user information in popover for all items', async () => {
        const numberOfItems = 10;  // Assuming 10 items to verify

        for (let i = 0; i < numberOfItems; i++) {
            await listPage.openPopover(i);
            await listPage.verifyPopoverUserInfo(i);  // Automatically retrieves user info from the list item
            // I am refreshing the so that the popover disappears and we start over
            await listPage.navigate();
            await listPage.navigatedToPage();
        }
    });


    ///
    // The task is: Ensure the user avatar matches the one in the list item, as well as it's the correct size 42x42px
    // But from what i see the listItem avatar and popover avatar are not the same size
    // In this test i am only verifying the popover avatar sizes
    ///
    test('Verify avatar size for all items', async () => {
        for (let i = 0; i < 10; i++) {
            await listPage.openPopover(i);
            await listPage.verifyAvatarSize(i);
            // I am refreshing the so that the popover disappears and we start over
            await listPage.navigate();
            await listPage.navigatedToPage();
        }
    });

    test('Verify user name CSS properties for all items', async () => {
        for (let i = 0; i < 10; i++) {
            await listPage.openPopover(i);
            await listPage.verifyUserNameCss(i);
            // I am refreshing the so that the popover disappears and we start over
            await listPage.navigate();
            await listPage.navigatedToPage();
        }
    });

});

