<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Auth Endpoints
Route::group([
    'prefix' => 'v1/auth'
], function ($router) {
    Route::post('login', 'Auth\LoginController@login');
    Route::post('logout', 'Auth\LogoutController@logout');
    Route::post('register', 'Auth\RegisterController@register');
    Route::post('forgot-password', 'Auth\ForgotPasswordController@email');
    Route::post('password-reset', 'Auth\ResetPasswordController@reset');
});

// Resource Endpoints
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('user/hash', 'SystemUSerController@getHashId');
    Route::post('item/import', 'ItemController@importItem');
    Route::post('items/withbalances', 'ItemController@itemWbalances');
    Route::post('customer/import', 'CustomerController@importCustomer');
    Route::post('supplier/import', 'SupplierController@importSupplier');
    Route::post('project/import', 'ProjectController@importProject');
    Route::post('item/category', 'ItemController@getItem');
    Route::post('getopts', 'ItemController@getOpts');
    Route::post('itemonly', 'ItemController@itemonly');
    Route::post('project/upbal', 'ProjectController@updateBalance');
    Route::post('customer/upbal', 'CustomerController@updateBalance');
    Route::post('office/upbal', 'BranchController@updateBalance');
    Route::post('supplier/upbal', 'SupplierController@updateBalance');
    Route::apiResource('todo', 'TodoController');
    Route::apiResource('brand', 'BrandController');
    Route::apiResource('unit', 'UnitController');
    Route::apiResource('category', 'ItemCategoryController');
    Route::apiResource('branch', 'BranchController');
    Route::apiResource('supplier', 'SupplierController');
    Route::apiResource('project', 'ProjectController');
    Route::apiResource('item', 'ItemController');
    Route::apiResource('position', 'PositionController');
});

// Personnel
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::get('systemusers', 'SystemUserController@index');
    Route::post('employee', 'EmployeeController@CreateEmployee');
    Route::post('sysuadd', 'SystemUserController@CreateSystemUser');
    Route::apiResource('sysu', 'SystemUserController');
    Route::apiResource('ledtyioo', 'SystemUserController');
    Route::apiResource('empsfsa', 'EmployeeController');
});

// Customer
Route::group([
    'prefix' => 'v1'
], function ($router) {
    // Route::post('customer', 'CustomerController@CreateCustomer');
    Route::apiResource('customer', 'CustomerController');
});

// Local POS UploadController
Route::group([
    'prefix' => 'v1/upload'
], function ($router) {
    // Route::post('customer', 'CustomerController@CreateCustomer');
    Route::post('local', 'LocalPosUploadController@store');
});


// requisition
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('reqnew', 'RequestItemController@storeNew');
    Route::post('requestadd', 'RequestController@store');
    Route::post('sendforapp', 'RequestController@sendForApproval');
    Route::post('releaseitemreq', 'TransferController@releaseReq');
    Route::post('requestindex', 'RequestItemController@reitems');
    Route::apiResource('request', 'RequestController');
    Route::apiResource('requestitems', 'RequestItemController');
});

// approval
Route::group([
    'prefix' => 'v1/approval'
], function ($router) {
    Route::apiResource('requests', 'RequestApprovalController');
});

// udpate offline
Route::group([
    'prefix' => 'v1/offline'
], function ($router) {
    Route::apiResource('data', 'UpdateHistoryController');
});


// external
Route::group([
    'prefix' => 'v1/ex'
], function ($router) {
    Route::post('all', 'ExternalController@index');
});

// transaction
Route::group([
    'prefix' => 'v1/transaction'
], function ($router) {
    Route::post('receive/transfer', 'TransferController@index');
    Route::post('receive/transfer/direct', 'TransferController@directTransafer');
    Route::post('receive/transfer/direct/pos/release', 'TransferController@POSRelease');
    Route::post('receive/purchase', 'PurchaseController@index');
    Route::post('receive/purchaseitem', 'PurchaseController@updateItem');
    Route::post('receive/purchaseitemnew', 'PurchaseController@updateItemNew');
    Route::get('receive/purchase/noreqexisting', 'PurchaseController@noreqIndex');
    Route::post('receive/purchase/noreqexisting', 'PurchaseController@noreqInsert');
    Route::post('receive/purchase/noreqnonexisting', 'PurchaseController@noreqnewInsert');
    Route::post('receiving/import', 'PurchaseController@importReceiving');
    Route::post('receiving/historical', 'PurchaseController@historicalPurchase');
    Route::post('sales/new', 'SalesController@addSales');
    Route::post('sales/charge/customer', 'SalesController@customer_charge');
    Route::post('sales/charge/project', 'SalesController@project_charge');
    Route::post('sales/customer/charges', 'SalesController@getAllCustCharge');
    Route::post('sales/project/charges', 'SalesController@getAllProjCharge');
    Route::post('sales/office/charges', 'SalesController@getAllOffCharge');
    Route::post('refreshstocks', 'SalesController@refreshStock');
    Route::post('sales/charge/office', 'SalesController@office_charge');
    Route::post('sales/stocks', 'SalesController@getAllstocks');
    Route::post('sales/customers', 'SalesController@getAllcustomers');
    Route::post('sales/projects', 'SalesController@getAllprojects');
    Route::post('return/getcode', 'SalesController@getReceiptCode');
    Route::post('returnItem', 'POSController@itemReturn');
    // Route::post('returnItem', 'POSController@wait');
    Route::post('pay/supplier/charges', 'PaySupplierController@supplier_charge');
    Route::post('pay/addpdc', 'PaySupplierController@addPDC');
    Route::post('pay/import', 'PaySupplierController@importPDC');
    Route::post('pay/uppdc', 'PaySupplierController@updatecheq');
    Route::post('pay/supplier/charges/items', 'PaySupplierController@receiveditems');
    Route::post('pay/supplier/confirmation', 'PaySupplierController@confirmPayment');
    Route::post('sales/paycharge/pos', 'POSController@storeCharge');
    // Route::post('sales/addsales', 'AddSalesController@addsales');
    Route::apiResource('sales', 'SalesController');
    Route::apiResource('addsales', 'AddSalesController');
    Route::apiResource('pay/supplier', 'PaySupplierController');
    Route::apiResource('pos', 'POSController');
    Route::apiResource('receive/transferitem', 'TransferController');
    
});

// stocks
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::get('defectives', 'StocksController@defectives');
    Route::post('upThreshold', 'StocksController@update');
    Route::post('stocksMod', 'StocksController@index');
    Route::post('stocks/upbal', 'StocksController@updateBalance');
    Route::apiResource('stocks', 'StocksController');
});

// stocks
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('sysmode', 'SystemModeController@getSpecs');
});

// reset counter
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('current/data', 'ResetCountController@index');
    Route::post('reset/counter', 'ResetCountController@resetCounter');
});

// NewPOs


Route::group([
    'prefix' => 'v1/newpos'
], function ($router) {
    Route::get('item/stocks', 'NewPosController@branchItemStocks');
    Route::get('current/user', 'NewPosController@curUserDet');
    Route::post('save', 'NewPosController@store');
    Route::post('ctrlno', 'NewPosController@getFutureCtrlnoExternal');
    Route::post('serveddet', 'NewPosController@getServeCountToday');
});

// charts
Route::group([
    'prefix' => 'v1/charts'
], function ($router) {
    // Route::get('sales', 'ChartController@saleschart');
    Route::post('sales', 'ChartController@saleschart');
});

// itemreturn
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::apiResource('return', 'ReturnController');
});

// remittance
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('remit/transactions', 'RemitController@getTrans');
    Route::post('remit/transactions/nocf', 'RemitController@getTransNoCF');
    Route::post('remit/transactions/accumulated', 'RemitController@getTransNoCF_Accu');
    Route::post('remit/update', 'RemitController@updateRemit');
    Route::apiResource('remit', 'RemitController');
});

// physicalcounts
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('physcount/items', 'PhysCntController@getItems');
    Route::post('physcount/update/live', 'PhysCntController@upLiveUp');
    Route::apiResource('physcount', 'PhysCntController');
});

// reports
Route::group([
    'prefix' => 'v1/reports'
], function ($router) {
    Route::get('sales', 'ReportController@sales');
    Route::post('received', 'ReportController@received');
    Route::post('receiveditems', 'ReportController@receiveditems');
    Route::post('transacs', 'ReportController@allTransac');
    Route::post('saleItems', 'ReportController@saleItems');
    Route::post('specitemledger', 'ReportController@specItemLedger');
    Route::post('speccustomerledger', 'ReportController@specCustomerLedger');
    Route::post('specprojectledger', 'ReportController@specProjectLedger');
    Route::post('specofficeledger', 'ReportController@specOfficeLedger');
    Route::post('chart', 'ReportController@chart');
    Route::post('specsupplierLedger', 'ReportController@specSupplierLedger');
    Route::post('stocks', 'ReportController@stockrep');
    Route::post('remittance', 'ReportController@remittances');
    Route::post('indvPur', 'ReportController@indivPurchases');
    Route::post('indvSalesRev', 'ReportController@indivSalesRev');
    Route::post('indivAllRelease', 'ReportController@indivAllRelease');
    Route::post('indivChargeRev', 'ReportController@indivChargeRev');
    Route::post('GenindivRev', 'ReportController@GenindivRev');
    Route::post('upLogs', 'ReportController@upLogsitm');
    Route::post('upActLogs', 'ReportController@upActLogs');
    Route::post('deletedItms', 'ReportController@allDeletedItm');
    Route::post('deletedItms/remove', 'ReportController@destroyDeletedItm');
    Route::post('check/credit', 'ReportController@checkCredit');
    Route::post('deleted/credits', 'ReportController@deletedCredits');
    Route::post('specTransaction', 'ReportController@specificTransaction');
    Route::post('deleted/receivings', 'ReportController@deletedRecTrans');
    Route::post('payment/charges', 'ReportController@paychargerep');
    Route::post('getDebitTrans', 'ReportController@getDebitTrans');
    Route::post('saleCodeRet', 'ReportController@saleCodeRet');
    Route::post('getExcessTrans', 'ReportController@getExcessTrans');
    Route::post('getRepItemCurrentStock', 'ReportController@getRepItemCurrentStock');
});

// header
Route::group([
    'prefix' => 'v1/header'
], function ($router) {
    Route::get('user', 'HeaderController@index');
    Route::post('role', 'HeaderController@userfilt');
});

// sysuser
Route::group([
    'prefix' => 'v1/users'
], function ($router) {
    Route::post('/cashiers', 'SystemUserController@getCashier');
});

// notification
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::apiResource('upnotif', 'NotificationController');
});


// Dashboard
Route::group([
    'prefix' => 'v1/dash'
], function ($router) {
    Route::get('directsales', 'DashboardController@directsales');
    // Route::get('index', 'DashboardController@index');
    Route::post('index', 'DashboardController@dashall');
});

// grant acc
Route::group([
    'prefix' => 'v1/grant'
], function ($router) {
    Route::post('acsupad', 'SupAccess@supacc');
});

// modify transaction
Route::group([
    'prefix' => 'v1/mod'
], function ($router) {
    Route::post('transaction', 'ModTransactionController@upTrans');
    Route::post('transaction/items', 'ModTransactionController@upTransitems');
    Route::post('transaction/receiving', 'ModTransactionController@upTransitemsNew');
    Route::post('transaction/sales', 'ModTransactionController@updateTransactionSales');
    Route::post('transaction/sales/items', 'ModTransactionController@updateSalesItems');
    Route::post('transaction/sales/items/charge', 'ModTransactionController@updateSalesItemsCharge');
    Route::post('transaction/sales/items/add', 'ModTransactionController@addSalesItems');
    Route::post('transaction/sales/items/add/charge', 'ModTransactionController@addSalesItemsCharge');
    Route::post('transaction/charge', 'ModTransactionController@updateTransactionCharge');
    Route::post('transaction/paymentcharge', 'ModTransactionController@updatePaymentCharge');
    Route::post('transaction/purchasecredit', 'ModTransactionController@modPurchaseCredit');
    Route::post('transaction/deactivate', 'ModTransactionController@deactivateTransaction');
    Route::post('transaction/debit', 'ModTransactionController@modDebit');
    Route::post('transaction/return', 'ModTransactionController@updatereturn');
    Route::post('transaction/replacement', 'ModTransactionController@updateReplace');
    Route::post('transaction/replacement/charge', 'ModTransactionController@updateReplaceCharge');
    Route::post('transaction/seriesno/sales', 'ModTransactionController@placeSN_DR');
    Route::post('transaction/seriesno/charge', 'ModTransactionController@placeSN_Charge');
    Route::post('transaction/seriesno/return', 'ModTransactionController@placeSN_Return');
    Route::post('getSaleLastSN', 'ModTransactionController@getSaleLastSN');
    Route::post('updateLateSpec', 'ModTransactionController@updateLateSpec');
    Route::post('inventory/update', 'ModTransactionController@inventoryUpdate');
    // Route::post('transaction/receiving', 'ModTransactionController@transUpItm');
});

// payroll
Route::group([
    'prefix' => 'v1/payroll'
], function ($router) {
    Route::post('getpayroll', 'PayrollController@getPayroll');
    Route::post('printpayroll', 'PayrollController@printPayrolls');
    Route::post('getsummary', 'PayrollController@getSummary');
    Route::post('import/employee', 'PayrollEmpController@importEmp');
    Route::apiResource('employee', 'PayrollEmpController');
    Route::apiResource('department', 'DepartmentController');
    Route::apiResource('payrange', 'PayrollController');
});


// cashflow
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('cashinadmin', 'CashierCashController@cashinadmin');
    Route::post('cashoutadmin', 'CashierCashController@cashoutadmin');
    Route::post('getcash', 'CashierCashController@index');
    Route::post('upcashflowstat', 'CashierCashController@updateCashflowStatus');
    Route::post('cashflowRep', 'CashierCashController@cashflowRep');
    Route::post('modTransCashflow', 'CashierCashController@modTransCashflow');
    Route::post('cashflowUpRep', 'CashierCashController@cashflowUpRep');
    Route::post('todaysEarnings', 'CashierCashController@todayEarnings');
    Route::post('storePettyCash', 'CashierCashController@storePettyCash');
    Route::post('getPettyCash', 'CashierCashController@getPettyCash');
    Route::post('updatePettyCash', 'CashierCashController@updatePettyCash');
    Route::post('destroyPetty', 'CashierCashController@destroyPetty');
});


// conversion
Route::group([
    'prefix' => 'v1'
], function ($router) {
    Route::post('createsubqty', 'ConversionController@AddSubQty');
    Route::post('creatematch', 'ConversionController@AddMatchItm');
    Route::post('GetConvDet', 'ConversionController@GetConvDet');
    Route::post('removesubqty', 'ConversionController@RemoveSubQty');
    Route::post('unlinkmatch', 'ConversionController@unlinkmatch');
    Route::post('getitems', 'ConversionController@GetItems');
    Route::post('getmatchitems', 'ConversionController@GetMatchedItems');
    Route::post('convert', 'ConversionController@convert');
});


// Not Found
Route::fallback(function(){
    return response()->json(['message' => 'Resource not found.'], 404);
});
