<?php

namespace App\Enums;

enum AccountStatus: string
{
    case Active = 'active';
    case Warning = 'warning';
    case Suspended = 'suspended';
}
