<?php

namespace App\Filament\Resources\CmsPageSections\Pages;

use App\Filament\Resources\CmsPageSections\CmsPageSectionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewCmsPageSection extends ViewRecord
{
    protected static string $resource = CmsPageSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
