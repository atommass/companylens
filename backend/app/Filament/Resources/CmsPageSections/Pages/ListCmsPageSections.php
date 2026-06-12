<?php

namespace App\Filament\Resources\CmsPageSections\Pages;

use App\Filament\Resources\CmsPageSections\CmsPageSectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCmsPageSections extends ListRecords
{
    protected static string $resource = CmsPageSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
