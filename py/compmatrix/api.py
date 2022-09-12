from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles

from py.compmatrix.queries import get_churn_between_sdks, get_churn_examples_between_sdks, get_churn_examples_from_none, get_churn_examples_to_none, get_churn_from_none, get_churn_to_none, get_examples_for_sdk, get_examples_not_involved, get_not_involved, get_sdk_totals, get_sdks


app = FastAPI()

app.mount("/web", StaticFiles(directory="static"), name="static")


@app.get("/sdk")
def get_sdk():
    return [
        {
            'slug': sdk.slug,
            'name': sdk.name
        }
        for sdk in get_sdks()
    ]

@app.post('/matrix')
async def get_matrix(req : Request):
    
    params = await req.json()
    sdk_choice = params['sdks']

    churn = get_churn_between_sdks(sdk_choice)
    churn_from_none = get_churn_from_none(sdk_choice)
    churn_to_none = get_churn_to_none(sdk_choice)
    totals = get_sdk_totals(sdk_choice)
    not_involved = get_not_involved(sdk_choice)

    return [ # could do better but it works
        *(
            {"from": sdk1.slug, "to": sdk2.slug, "count": qty}
            for _, _, sdk1, sdk2, qty in churn
        ),
        *(
            { "from": None, "to": sdk2.slug, "count": qty}
            for _, _, _, sdk2, qty in churn_from_none
        ),
        *(
            { "from": sdk1.slug, "to": None, "count": qty}
            for _, _, sdk1, _, qty in churn_to_none
        ),
        *(
            { "from": sdk.slug, "to": sdk.slug, "count": qty}
            for qty, _, sdk in totals
        ),
        *(
            { "from": None, "to": None, "count": qty}
            for (qty,) in not_involved
        ),
    ]

@app.post('/example')
async def get_matrix(req : Request):
    
    params = await req.json()
    sdk_choice = params['sdks']
    slug1 = params['fromSlug']
    slug2 = params['toSlug']

    # TODO This would be nicer with pattern matching (switch case)
    if slug1 != "null":
        
        if slug2 == "null":
            return [
                app.name for _, _, _, _, app in get_churn_examples_to_none(slug1, sdk_choice)
            ]
        if slug1 != slug2:
            return [ 
                app.name for _, _, _, _, app in get_churn_examples_between_sdks(slug1, slug2)
            ]
        
        return [ 
            app.name for _, _, app in get_examples_for_sdk(slug1)
        ]
    
    if slug2 != "null":
        return [ 
            app.name for _, _, _, _, app in get_churn_examples_from_none(slug2, sdk_choice)
        ]
    
    return [ 
        app.name for app in get_examples_not_involved(sdk_choice)
    ]
