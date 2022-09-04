<!-- Consideration during implementation -->

For data seeding
1. Input the Main branch first in brajnch table before inputting a user
2. Input the following to the positions (They will not be displayed they will be hidden so that they cannot be modified)
    - Admin           id: 1 created_at: (any)    updated_at: (any)
    - Cashier         id: 2 created_at: (any)    updated_at: (any)
    - HR              id: 3 created_at: (any)    updated_at: (any)
    - Superadmin      id: 4 created_at: (any)    updated_at: (any)
    - Inventory      id: 5 created_at: (any)    updated_at: (any)
    - Unassigned      id: 20 created_at:(any)    updated_at: (any)

3. Input the following to the category (Default)
    - Miscellaneous   id: 1 created_at: (any)   updated_at: (any)
    
4. Input the following to the Brand (Default)
    - No Brand        id: 1 created_at: (any)   updated_at: (any)
    
5. Input the following to the Suppliers (Default)
    - Not Specified   id: 1 created_at: (any)   updated_at: (any)

6. Input the following to the Department (Default)
    - Unassigned      id: 1 created_at: (any)   updated_at: (any)
    
7. Make sure all float field is float(field), there are instances when migrating it will become double(field) the data will be 9.999

8. Add default pin in Pin table

    