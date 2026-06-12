<?php

namespace App\Filament\Resources\CmsPageSections\Schemas;

use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CmsPageSectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('cms_page_id')
                    ->relationship('page', 'title')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('type')
                    ->required()
                    ->maxLength(255),
                TextInput::make('title'),
                KeyValue::make('content')
                    ->columnSpanFull(),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
