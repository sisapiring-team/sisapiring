<?php

namespace App\Enums;

enum ModerationStatus: string
{
    case Active = 'active';
    case UnderReview = 'under_review';
    case TakenDown = 'taken_down';
}
