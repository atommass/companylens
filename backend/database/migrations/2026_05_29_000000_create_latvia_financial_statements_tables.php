<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_statements', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->string('legal_entity_registration_number')->index();
            $table->string('source_schema')->nullable();
            $table->string('source_type')->nullable();
            $table->unsignedSmallInteger('year')->index();
            $table->date('year_started_on')->nullable();
            $table->date('year_ended_on')->nullable();
            $table->unsignedInteger('employees')->nullable();
            $table->string('rounded_to_nearest')->nullable();
            $table->string('currency', 8)->nullable();
            $table->dateTime('created_at')->nullable();

            $table->foreign('legal_entity_registration_number')
                ->references('registration_number')
                ->on('companies')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });

        Schema::create('balance_sheets', function (Blueprint $table) {
            $table->unsignedBigInteger('statement_id')->primary();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->bigInteger('cash')->nullable();
            $table->bigInteger('marketable_securities')->nullable();
            $table->bigInteger('accounts_receivable')->nullable();
            $table->bigInteger('inventories')->nullable();
            $table->bigInteger('total_current_assets')->nullable();
            $table->bigInteger('investments')->nullable();
            $table->bigInteger('fixed_assets')->nullable();
            $table->bigInteger('intangible_assets')->nullable();
            $table->bigInteger('total_non_current_assets')->nullable();
            $table->bigInteger('total_assets')->nullable();
            $table->bigInteger('future_housing_repairs_payments')->nullable();
            $table->bigInteger('current_liabilities')->nullable();
            $table->bigInteger('non_current_liabilities')->nullable();
            $table->bigInteger('provisions')->nullable();
            $table->bigInteger('equity')->nullable();
            $table->bigInteger('total_equities')->nullable();

            $table->foreign('statement_id')
                ->references('id')
                ->on('financial_statements')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });

        Schema::create('income_statements', function (Blueprint $table) {
            $table->unsignedBigInteger('statement_id')->primary();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->bigInteger('net_turnover')->nullable();
            $table->bigInteger('by_nature_inventory_change')->nullable();
            $table->bigInteger('by_nature_long_term_investment_expenses')->nullable();
            $table->bigInteger('by_nature_other_operating_revenues')->nullable();
            $table->bigInteger('by_nature_material_expenses')->nullable();
            $table->bigInteger('by_nature_labour_expenses')->nullable();
            $table->bigInteger('by_nature_depreciation_expenses')->nullable();
            $table->bigInteger('by_function_cost_of_goods_sold')->nullable();
            $table->bigInteger('by_function_gross_profit')->nullable();
            $table->bigInteger('by_function_selling_expenses')->nullable();
            $table->bigInteger('by_function_administrative_expenses')->nullable();
            $table->bigInteger('by_function_other_operating_revenues')->nullable();
            $table->bigInteger('other_operating_expenses')->nullable();
            $table->bigInteger('equity_investment_earnings')->nullable();
            $table->bigInteger('other_long_term_investment_earnings')->nullable();
            $table->bigInteger('other_interest_revenues')->nullable();
            $table->bigInteger('investment_fair_value_adjustments')->nullable();
            $table->bigInteger('interest_expenses')->nullable();
            $table->bigInteger('extra_revenues')->nullable();
            $table->bigInteger('extra_expenses')->nullable();
            $table->bigInteger('income_before_income_taxes')->nullable();
            $table->bigInteger('provision_for_income_taxes')->nullable();
            $table->bigInteger('income_after_income_taxes')->nullable();
            $table->bigInteger('other_taxes')->nullable();
            $table->bigInteger('extra_dividends')->nullable();
            $table->bigInteger('net_income')->nullable();

            $table->foreign('statement_id')
                ->references('id')
                ->on('financial_statements')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });

        Schema::create('cash_flow_statements', function (Blueprint $table) {
            $table->unsignedBigInteger('statement_id')->primary();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->bigInteger('cfo_dm_cash_received_from_customers')->nullable();
            $table->bigInteger('cfo_dm_cash_paid_to_suppliers_employees')->nullable();
            $table->bigInteger('cfo_dm_other_cash_received_paid')->nullable();
            $table->bigInteger('cfo_dm_operating_cash_flow')->nullable();
            $table->bigInteger('cfo_dm_interest_paid')->nullable();
            $table->bigInteger('cfo_dm_income_taxes_paid')->nullable();
            $table->bigInteger('cfo_dm_extra_items_cash_flow')->nullable();
            $table->bigInteger('cfo_dm_net_operating_cash_flow')->nullable();
            $table->bigInteger('cfo_im_income_before_income_taxes')->nullable();
            $table->bigInteger('cfo_im_income_before_changes_in_working_capital')->nullable();
            $table->bigInteger('cfo_im_operating_cash_flow')->nullable();
            $table->bigInteger('cfo_im_interest_paid')->nullable();
            $table->bigInteger('cfo_im_income_taxes_paid')->nullable();
            $table->bigInteger('cfo_im_extra_items_cash_flow')->nullable();
            $table->bigInteger('cfo_im_net_operating_cash_flow')->nullable();
            $table->bigInteger('cfi_acquisition_of_stocks_shares')->nullable();
            $table->bigInteger('cfi_sale_proceeds_from_stocks_shares')->nullable();
            $table->bigInteger('cfi_acquisition_of_fixed_assets_intangible_assets')->nullable();
            $table->bigInteger('cfi_sale_proceeds_from_fixed_assets_intangible_assets')->nullable();
            $table->bigInteger('cfi_loans_made')->nullable();
            $table->bigInteger('cfi_repayments_of_loans_received')->nullable();
            $table->bigInteger('cfi_interest_received')->nullable();
            $table->bigInteger('cfi_dividends_received')->nullable();
            $table->bigInteger('cfi_net_investing_cash_flow')->nullable();
            $table->bigInteger('cff_proceeds_from_stocks_bonds_issuance_or_contributed_capital')->nullable();
            $table->bigInteger('cff_loans_received')->nullable();
            $table->bigInteger('cff_subsidies_grants_donations_received')->nullable();
            $table->bigInteger('cff_repayments_of_loans_made')->nullable();
            $table->bigInteger('cff_repayments_of_lease_obligations')->nullable();
            $table->bigInteger('cff_dividends_paid')->nullable();
            $table->bigInteger('cff_net_financing_cash_flow')->nullable();
            $table->bigInteger('effect_of_exchange_rate_change')->nullable();
            $table->bigInteger('net_increase')->nullable();
            $table->bigInteger('at_beginning_of_year')->nullable();
            $table->bigInteger('at_end_of_year')->nullable();

            $table->foreign('statement_id')
                ->references('id')
                ->on('financial_statements')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_flow_statements');
        Schema::dropIfExists('income_statements');
        Schema::dropIfExists('balance_sheets');
        Schema::dropIfExists('financial_statements');
    }
};