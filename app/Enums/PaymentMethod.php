<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Qris = 'qris';
    case Cod = 'cod';
}
