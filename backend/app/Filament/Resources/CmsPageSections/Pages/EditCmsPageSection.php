<?php

namespace App\Filament\Resources\CmsPageSections\Pages;

use App\Filament\Resources\CmsPageSections\CmsPageSectionResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditCmsPageSection extends EditRecord
{
    protected static string $resource = CmsPageSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
