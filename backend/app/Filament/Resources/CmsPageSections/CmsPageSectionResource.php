<?php

namespace App\Filament\Resources\CmsPageSections;
use UnitEnum;

use App\Filament\Resources\CmsPageSections\Pages\CreateCmsPageSection;
use App\Filament\Resources\CmsPageSections\Pages\EditCmsPageSection;
use App\Filament\Resources\CmsPageSections\Pages\ListCmsPageSections;
use App\Filament\Resources\CmsPageSections\Pages\ViewCmsPageSection;
use App\Filament\Resources\CmsPageSections\Schemas\CmsPageSectionForm;
use App\Filament\Resources\CmsPageSections\Schemas\CmsPageSectionInfolist;
use App\Filament\Resources\CmsPageSections\Tables\CmsPageSectionsTable;
use App\Models\CmsPageSection;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CmsPageSectionResource extends Resource
{
    protected static ?string $model = CmsPageSection::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return CmsPageSectionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CmsPageSectionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CmsPageSectionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCmsPageSections::route('/'),
            'create' => CreateCmsPageSection::route('/create'),
            'view' => ViewCmsPageSection::route('/{record}'),
            'edit' => EditCmsPageSection::route('/{record}/edit'),
        ];
    }
}
