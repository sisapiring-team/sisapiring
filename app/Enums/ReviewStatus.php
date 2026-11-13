<?php

namespace App\Enums;

enum ReviewStatus: string
{
    case Published = 'published';
    case Flagged = 'flagged';
    case Hidden = 'hidden';
}
