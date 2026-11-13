<?php

namespace App\Enums;

enum EscrowType: string
{
    case Hold = 'hold';
    case Release = 'release';
    case Refund = 'refund';
}
