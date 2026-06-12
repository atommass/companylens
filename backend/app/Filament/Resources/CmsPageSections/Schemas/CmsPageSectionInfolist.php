<?php

namespace App\Filament\Resources\CmsPageSections\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CmsPageSectionInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('cms_page_id')
                    ->numeric(),
                TextEntry::make('type'),
                TextEntry::make('title')
                    ->placeholder('-'),
                TextEntry::make('sort_order')
                    ->numeric(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
