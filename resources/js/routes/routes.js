import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Archive from '../pages/Archive';
import NoMatch from '../pages/NoMatch';
import Settings from '../pages/settings/index';
import MainRequest from '../pages/requisition/request_main';
import RequestItem from '../pages/requisition/request_items';
import RequestItemExist from '../pages/requisition/request_item_exist';
import ReqEvaluation from '../pages/requisition/requestevaluation';
import ApprovalRequests from '../pages/requisition/approval_main';
import ApprovalRequestItem from '../pages/requisition/approval_req_items';
import ApprovalRequestItemExist from '../pages/requisition/approval_req_items_exist';
import Transactions from '../pages/transactions/index';
import Stocks from '../pages/stocks/index';
import ReceivingReports from '../pages/reports/receiving';
import RepRemittances from '../pages/reports/remittances';
import SalesReports from '../pages/reports/sales';
import ChargeReports from '../pages/reports/chargeReport';
import GeneralReport from '../pages/reports/generalReport';
import ReplaceReport from '../pages/reports/replaceReport';
import DeletedCredits from '../pages/reports/deletedCredits';
import PayChargeReport from '../pages/reports/payChargeReport';
import StockReport from '../pages/reports/stockreport';
import ReturnReports from '../pages/reports/returnReport';
import ItemLedger from '../pages/reports/itemLedger';
import CustomerLedger from '../pages/reports/customerLedger';
import ProjectLedger from '../pages/reports/projectLedger';
import OfficeLedger from '../pages/reports/officeLedger';
import SupplierLedger from '../pages/reports/supplierLedger';
import SpecItemLedger from '../pages/reports/specItemLedger';
import SpecCustomerLedger from '../pages/reports/specCustomerLedger';
import SpecProjectLedger from '../pages/reports/specProjectLedger';
import SpecOfficeLedger from '../pages/reports/specOfficeLedger';
import UpdatLog from '../pages/reports/updateLog';
import UpdatLogRec from '../pages/reports/updateLogReceving';
import UpdatLogRecTrans from '../pages/reports/updateLogRecevingTrans';
import UpdatLogRecCrd from '../pages/reports/updateLogRecevingCredit';
import UpdatLogCashFlow from '../pages/reports/upLogCashFlow';
import upLogSales from '../pages/reports/upLogSales';
import UpdateSales from '../pages/reports/updateSales';
import UpdateReturn from '../pages/reports/updateReturn';
import UpdatePaymentCharge from '../pages/reports/updatePaymentCharge';
import UpActLogRemit from '../pages/reports/upActLogsRemittance';
import DeletedItems from '../pages/reports/deletedItems';
import InvItems from '../pages/reports/indvItems';
import UserCashFlow from '../pages/reports/userSpecCashflow';
import ModifySalesItems from '../pages/reports/modifySalesItem';
import PrintAllItems from '../pages/reports/allItems';
import UpdateTransaction from '../pages/reports/updateTransaction';
import BranchRequest from '../pages/requisition/branch_request';
import SpecSupplierLedger from '../pages/reports/specSupplierLedger';
import Sales from '../pages/transactions/sales';
import DirectTransfer from '../pages/transactions/directTransfer';
import DirectTransferPOS from '../pages/transactions/directTransfer';
import SalesNT from '../pages/transactions/salesNewTab';
import AllRep from '../pages/reports/allRep';
import Remittance from '../pages/transactions/remittance';
import PettyCash from '../pages/transactions/petty_cash';
import AllItems from '../pages/transactions/allitems';
import Conversion from '../pages/transactions/conversion';
import PaySupplier from '../pages/transactions/pay_supplier';
import ChqSups from '../pages/reports/chequeSuppliers';
import PhysicalCount from '../pages/physicalcount';
import SpecPhysicalCount from '../pages/specPhysCount';
import Users from '../pages/settings/people/users';
import Position from '../pages/settings/people/positions';
import Departments from '../pages/payroll/department';
import Items from '../pages/settings/items/items';
import Branches from '../pages/settings/branches';
import Suppliers from '../pages/settings/suppliers';
import Projects from '../pages/settings/projects';
import Customers from '../pages/settings/people/customer';
import Payroll from '../pages/payroll/payroll';
import PayrollSummary from '../pages/payroll/payrollSummary';
import PricePrint from '../pages/settings/items/priceprint';
import RNRExisting from '../pages/transactions/RNR_existing';
import HistoricalRNRExisting from '../pages/transactions/historical_RNR_existing';
import Purchase from '../pages/transactions/purchase';
import Transfer from '../pages/transactions/transfer';
import ExcPrev from '../pages/prints/excelReports';
import ExcPrevLedger from '../pages/prints/excelLedger';
import ItemizeCharge from '../pages/prints/itemizeCharge';
import ItemizeAllPay from '../pages/prints/itemizeAllPayments';

import NewPos from '../pages/new_pos/components/new_pos';
import NewPosDS from '../pages/new_pos/direct_sale/main_ds';
import NewMainMenu from '../pages/new_pos/external_menu/main_menu';
import ResetCounter from '../pages/new_pos/reset_counter';

const routes = [
  {
    path: '/',
    exact: true,
    auth: true,
    component: Dashboard,
    fallback: Home,
  },
  {
    path: '/login',
    exact: true,
    auth: false,
    component: Login,
  },
  {
    path: '/register',
    exact: true,
    auth: false,
    component: Register,
  },
  {
    path: '/forgot-password',
    exact: true,
    auth: false,
    component: ForgotPassword,
  },
  {
    path: '/reset-password',
    exact: true,
    auth: false,
    component: ResetPassword,
  },
  {
    path: '/archive',
    exact: true,
    auth: true,
    component: Archive,
  },
  {
    path: '/settings',
    exact: true,
    auth: true,
    component: Settings,
  },
  {
    path: '/requisition',
    exact: true,
    auth: true,
    component: MainRequest,
  },
  {
    path: '/allrep',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/allrep',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/report/sales',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/direct/transfer',
    exact: true,
    auth: true,
    component: DirectTransfer,
  },
  {
    path: '/direct/transfer/pos',
    exact: true,
    auth: true,
    component: DirectTransferPOS,
  },
  {
    path: '/modify/sales/items',
    exact: true,
    auth: true,
    component: ModifySalesItems,
  },
  {
    path: '/report/remittance',
    exact: true,
    auth: true,
    component: RepRemittances,
  },
  {
    path: '/pettycash',
    exact: true,
    auth: true,
    component: PettyCash,
  },
  {
    path: '/utilities/users',
    exact: true,
    auth: true,
    component: Users,
  },
  {
    path: '/utilities/items',
    exact: true,
    auth: true,
    component: Items,
  },
  {
    path: '/receive/norequest/purchase',
    exact: true,
    auth: true,
    component: RNRExisting,
  },
  {
    path: '/receive/norequest/purchase/historical',
    exact: true,
    auth: true,
    component: HistoricalRNRExisting,
  },
  {
    path: '/receive/transfer',
    exact: true,
    auth: true,
    component: Transfer,
  },
  {
    path: '/receive/withequest/purchase',
    exact: true,
    auth: true,
    component: Purchase,
  },
  {
    path: '/utilities/priceprint',
    exact: true,
    auth: true,
    component: PricePrint,
  },
  {
    path: '/utilities/branches',
    exact: true,
    auth: true,
    component: Branches,
  },
  {
    path: '/utilities/suppliers',
    exact: true,
    auth: true,
    component: Suppliers,
  },
  {
    path: '/utilities/projects',
    exact: true,
    auth: true,
    component: Projects,
  },
  {
    path: '/utilities/customers',
    exact: true,
    auth: true,
    component: Customers,
  }
  ,
  {
    path: '/report/receiving',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/report/excel/preview',
    exact: true,
    auth: true,
    component: ExcPrev,
  },
  {
    path: '/report/excel/preview/ledger',
    exact: true,
    auth: true,
    component: ExcPrevLedger,
  },
  {
    path: '/report/itemize/charge',
    exact: true,
    auth: true,
    component: ItemizeCharge,
  },
  {
    path: '/report/itemize/payments',
    exact: true,
    auth: true,
    component: ItemizeAllPay,
  },
  {
    path: '/report/receiving/items',
    exact: true,
    auth: true,
    component: InvItems,
  },
  {
    path: '/report/itemize',
    exact: true,
    auth: true,
    component: InvItems,
  },
  {
    path: '/report/user/cashflow',
    exact: true,
    auth: true,
    component: UserCashFlow,
  },
  {
    path: '/report/print/allitems',
    exact: true,
    auth: true,
    component: PrintAllItems,
  },
  {
    path: '/report/update/transaction',
    exact: true,
    auth: true,
    component: UpdateTransaction,
  },
  {
    path: '/conversion',
    exact: true,
    auth: true,
    component: Conversion,
  },
  {
    path: '/report/charges',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/report/stocks',
    exact: true,
    auth: true,
    component: StockReport,
  },
  {
    path: '/report/returns',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/payroll',
    exact: true,
    auth: true,
    component: Payroll,
  },
  {
    path: '/payroll/summary',
    exact: true,
    auth: true,
    component: PayrollSummary,
  },
  {
    path: '/payroll/position',
    exact: true,
    auth: true,
    component: Position,
  },
  {
    path: '/payroll/department',
    exact: true,
    auth: true,
    component: Departments,
  },
  {
    path: '/report/replacements',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/report/paymentcharges',
    exact: true,
    auth: true,
    component: AllRep,
  },
  {
    path: '/branchrequest',
    exact: true,
    auth: true,
    component: BranchRequest,
  },
  {
    path: '/requestitems/Purchase',
    exact: true,
    auth: true,
    component: RequestItem,
  },
  {
    path: '/reqevaluation',
    exact: true,
    auth: true,
    component: ReqEvaluation,
  },
  {
    path: '/requestitems/Transfer',
    exact: true,
    auth: true,
    component: RequestItemExist,
  },
  {
    path: '/approvals',
    exact: true,
    auth: true,
    component: ApprovalRequests,
  },
  {
    path: '/approvalitems',
    exact: true,
    auth: true,
    component: ApprovalRequestItem,
  },
  {
    path: '/approvalitems/Purchase',
    exact: true,
    auth: true,
    component: ApprovalRequestItem,
  },
  {
    path: '/approvalitems/Transfer',
    exact: true,
    auth: true,
    component: ApprovalRequestItemExist,
  },
  {
    path: '/transactions',
    exact: true,
    auth: true,
    component: Transactions,
  },
  {
    path: '/paysupplier',
    exact: true,
    auth: true,
    component: PaySupplier,
  },
  {
    path: '/Salesreports',
    exact: true,
    auth: true,
    component: SalesReports,
  },
  {
    path: '/physicalCount',
    exact: true,
    auth: true,
    component: PhysicalCount,
  },
  {
    path: '/specPhysicalCount',
    exact: true,
    auth: true,
    component: SpecPhysicalCount,
  },
  {
    path: '/Generalreports',
    exact: true,
    auth: true,
    component: GeneralReport,
  },
  {
    path: '/Chargereports',
    exact: true,
    auth: true,
    component: ChargeReports,
  },
  {
    path: '/ChqSuppliers',
    exact: true,
    auth: true,
    component: ChqSups,
  },
  {
    path: '/Replacereports',
    exact: true,
    auth: true,
    component: ReplaceReport,
  },
  {
    path: '/deleted/credits',
    exact: true,
    auth: true,
    component: DeletedCredits,
  },
  {
    path: '/payChargeReport',
    exact: true,
    auth: true,
    component: PayChargeReport,
  },
  {
    path: '/Returnreports',
    exact: true,
    auth: true,
    component: ReturnReports,
  },
  {
    path: '/Receivingreports',
    exact: true,
    auth: true,
    component: ReceivingReports,
  },
  {
    path: '/itemLedger',
    exact: true,
    auth: true,
    component: ItemLedger,
  },
  {
    path: '/customerLedger',
    exact: true,
    auth: true,
    component: CustomerLedger,
  },
  {
    path: '/projectLedger',
    exact: true,
    auth: true,
    component: ProjectLedger,
  },
  {
    path: '/officeLedger',
    exact: true,
    auth: true,
    component: OfficeLedger,
  },
  {
    path: '/supplierLedger',
    exact: true,
    auth: true,
    component: SupplierLedger,
  },
  {
    path: '/remittance',
    exact: true,
    auth: true,
    component: Remittance,
  },
  {
    path: '/specItemLedger',
    exact: true,
    auth: true,
    component: SpecItemLedger,
  },
  {
    path: '/specCustomerLedger',
    exact: true,
    auth: true,
    component: SpecCustomerLedger,
  },
  {
    path: '/specProjectLedger',
    exact: true,
    auth: true,
    component: SpecProjectLedger,
  },
  {
    path: '/specOfficeLedger',
    exact: true,
    auth: true,
    component: SpecOfficeLedger,
  },
  {
    path: '/updatLog',
    exact: true,
    auth: true,
    component: UpdatLog,
  },
  {
    path: '/updatLog/receiving',
    exact: true,
    auth: true,
    component: UpdatLogRec,
  },
  {
    path: '/updatLog/receiving/transaction',
    exact: true,
    auth: true,
    component: UpdatLogRecTrans,
  },
  {
    path: '/updatLog/receiving/credit',
    exact: true,
    auth: true,
    component: UpdatLogRecCrd,
  },
  {
    path: '/cashflow/log',
    exact: true,
    auth: true,
    component: UpdatLogCashFlow,
  },
  {
    path: '/uplog/sales',
    exact: true,
    auth: true,
    component: upLogSales,
  },
  {
    path: '/update/sales',
    exact: true,
    auth: true,
    component: UpdateSales,
  },
  {
    path: '/update/return',
    exact: true,
    auth: true,
    component: UpdateReturn,
  },
  {
    path: '/update/paymentcharge',
    exact: true,
    auth: true,
    component: UpdatePaymentCharge,
  },
  {
    path: '/updatLogRemit',
    exact: true,
    auth: true,
    component: UpActLogRemit,
  },
  {
    path: '/deleted/items',
    exact: true,
    auth: true,
    component: DeletedItems,
  },
  {
    path: '/specSupplierLedger',
    exact: true,
    auth: true,
    component: SpecSupplierLedger,
  },
  {
    path: '/stocks',
    exact: true,
    auth: true,
    component: Stocks,
  },
  {
    path: '/sales',
    exact: true,
    auth: true,
    component: Sales,
  }
  ,
  {
    path: '/pos',
    exact: true,
    auth: true,
    component: SalesNT,
  }
  ,
  {
    path: '/allitems',
    exact: true,
    auth: true,
    component: AllItems,
  },
  {
    path: '/main/pos',
    exact: true,
    auth: true,
    component: NewPos,
  },
  {
    path: '/pos/sales',
    exact: true,
    auth: true,
    component: NewPosDS,
  },
  {
    path: '/pos/menu',
    exact: true,
    auth: true,
    component: NewMainMenu,
  },
  {
    path: '/pos/reset/counter',
    exact: true,
    auth: true,
    component: ResetCounter,
  },
  {
    path: '',
    exact: false,
    auth: false,
    component: NoMatch,
  },
];

export default routes;

// /requestitems/:reqID